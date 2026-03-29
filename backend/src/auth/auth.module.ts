import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const opts = {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            // expiresIn is typed as StringValue in some versions — cast needed
            expiresIn: config.get('JWT_EXPIRES_IN', '15m') as unknown as number,
          },
        };
        return opts;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Role, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
