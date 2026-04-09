import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapUserToProfile(user: User) {
    const roles = user.roles?.map((r) => r.name) ?? [];
    const permissions = [
      ...new Set(
        user.roles?.flatMap((r) => r.permissions?.map((p) => p.name) ?? []) ?? [],
      ),
    ];
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isChurchMember: user.isChurchMember,
      churchName: user.churchName,
      isEntrepreneur: user.isEntrepreneur,
      businessName: user.businessName,
      departamento: user.departamento,
      municipio: user.municipio,
      avatarUrl: user.avatarUrl,
      memberSince: user.createdAt,
      roles,
      permissions,
    };
  }

  private async generateTokens(user: User) {
    const roles = user.roles?.map((r) => r.name) ?? [];
    const permissions = [
      ...new Set(
        user.roles?.flatMap((r) => r.permissions?.map((p) => p.name) ?? []) ?? [],
      ),
    ];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    // Refresh token: raw UUID returned to client, hashed version stored in DB
    const rawRefreshToken = randomUUID();
    const refreshHash = await bcrypt.hash(rawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const rtEntity = this.refreshTokensRepo.create({
      user,
      tokenHash: refreshHash,
      expiresAt,
    });
    await this.refreshTokensRepo.save(rtEntity);

    return { accessToken, refreshToken: rawRefreshToken };
  }

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException('Ya existe una cuenta con ese correo electrónico.');
    }

    const userRole = await this.rolesRepo.findOne({ where: { name: 'user' } });
    if (!userRole) {
      throw new BadRequestException('Roles del sistema no inicializados. Ejecuta el seed primero.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      phone: dto.phone?.trim() || null,
      isChurchMember: dto.isChurchMember,
      churchName: dto.isChurchMember ? dto.churchName?.trim() || null : null,
      isEntrepreneur: dto.isEntrepreneur,
      businessName: dto.isEntrepreneur ? dto.businessName?.trim() || null : null,
      departamento: dto.departamento,
      municipio: dto.municipio,
      roles: [userRole],
      isEmailVerified: false,
      verificationToken: randomUUID(),
    });

    const savedUser = await this.usersRepo.save(user);

    // Send the email asynchronously without waiting so UI doesn't hang long
    this.mailService.sendVerificationEmail(
      savedUser.email,
      savedUser.firstName,
      savedUser.verificationToken,
    ).catch(e => console.error('Error sending verification email', e));

    return { 
      message: 'Cuenta creada exitosamente. Por favor, revisa tu correo electrónico para verificar tu cuenta y poder iniciar sesión.',
      requiresVerification: true 
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Must use QueryBuilder to explicitly load passwordHash and tracking fields
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.failedLoginAttempts')
      .addSelect('user.lockedUntil')
      .addSelect('user.isEmailVerified')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Tu cuenta está bloqueada por demasiados intentos. Inténtalo de nuevo en ${waitMinutes} minutos, o recupera tu contraseña.`);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    
    if (!valid) {
      user.failedLoginAttempts += 1;
      
      // 5 failed attempts = 15 minutes lockout
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60000); 
      }
      
      await this.usersRepo.save(user);
      
      if (user.lockedUntil) {
        throw new UnauthorizedException('Has alcanzado el límite de intentos. Cuenta bloqueada por 15 minutos.');
      }
      
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    // Login successful
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.usersRepo.save(user);

    // Enforce Email Verification BEFORE issuing tokens
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('NOT_VERIFIED');
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.mapUserToProfile(user) };
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({ where: { verificationToken: token } });
    if (!user) {
      throw new BadRequestException('Enlace de verificación inválido o expirado.');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await this.usersRepo.save(user);

    return { message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isEmailVerified) throw new BadRequestException('El correo ya está verificado');

    user.verificationToken = randomUUID();
    await this.usersRepo.save(user);

    this.mailService.sendVerificationEmail(user.email, user.firstName, user.verificationToken)
      .catch(e => console.error('Error re-sending email', e));

    return { message: 'Correo de verificación reenviado.' };
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return success anyway to prevent email enumeration
      return { message: 'Si el correo existe, se han enviado las instrucciones.' };
    }

    const resetToken = randomUUID();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.usersRepo.save(user);

    this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken)
      .catch(e => console.error('Error sending reset email', e));

    return { message: 'Si el correo existe, se han enviado las instrucciones.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ 
      where: { resetPasswordToken: token } 
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Enlace de recuperación inválido o expirado.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    // Al setear nueva clave, también le damos una segunda oportunidad
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.usersRepo.save(user);

    return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  async refresh(rawRefreshToken: string) {
    // Find non-revoked, non-expired tokens and compare hash
    const tokens = await this.refreshTokensRepo.find({
      where: { isRevoked: false },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    let matchedToken: RefreshToken | null = null;
    for (const t of tokens) {
      if (t.expiresAt < new Date()) continue;
      const match = await bcrypt.compare(rawRefreshToken, t.tokenHash);
      if (match) { matchedToken = t; break; }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    // Revoke old refresh token (rotation)
    matchedToken.isRevoked = true;
    await this.refreshTokensRepo.save(matchedToken);

    const newTokens = await this.generateTokens(matchedToken.user);
    return newTokens;
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(userId: number) {
    // Revoke all refresh tokens for this user
    await this.refreshTokensRepo.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Sesión cerrada correctamente.' };
  }

  // ─── Get & Modify Profile ───────────────────────────────────────────────────

  async getMe(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return this.mapUserToProfile(user);
  }

  async updateProfile(userId: number, dto: Partial<User>) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    // Protect some fields from being updated directly here
    delete dto.passwordHash;
    delete dto.email;
    delete dto.isActive;
    delete dto.isEmailVerified;

    Object.assign(user, dto);
    await this.usersRepo.save(user);

    return this.mapUserToProfile(user);
  }

  async updatePassword(userId: number, data: any) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('La contraseña actual es incorrecta.');

    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    await this.usersRepo.save(user);
    
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
