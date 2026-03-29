import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SeedModule } from './database/seed/seed.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Database ──────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        // utf8mb4 for full emoji support
        charset: 'utf8mb4',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,   // auto-creates/updates tables (dev only)
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // ── Feature Modules ───────────────────────────────────────────────────
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    SeedModule,
    CategoriesModule,
    ProductsModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
