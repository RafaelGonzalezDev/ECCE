import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/entities/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Category, Product]),
    CloudinaryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
