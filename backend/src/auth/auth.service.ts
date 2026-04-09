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
    });

    const savedUser = await this.usersRepo.save(user);

    // Reload with relations for token generation
    const fullUser = await this.usersRepo.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });

    const tokens = await this.generateTokens(fullUser!);
    return { ...tokens, user: this.mapUserToProfile(fullUser!) };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Must use QueryBuilder to explicitly load passwordHash (column has select:false)
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos.');
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.mapUserToProfile(user) };
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

  // ─── Get Me ───────────────────────────────────────────────────────────────

  async getMe(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return this.mapUserToProfile(user);
  }
}
