import {
  Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: User, @Body() body: any) {
    return this.authService.updateProfile(user.id, body);
  }

  @Post('me/password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@CurrentUser() user: User, @Body() body: any) {
    return this.authService.updatePassword(user.id, body);
  }

  // ─── Verification & Recovery ─────────────────────────────────────────────

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
