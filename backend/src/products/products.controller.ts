import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { User } from '../users/user.entity';

import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermission('marketplace:write') // Solo emprendedores y admins pueden crear
  @UseInterceptors(FilesInterceptor('images', 4)) // Max 4 imágenes
  create(
    @CurrentUser() user: User,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.create(user, createProductDto, files || []);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyProducts(@CurrentUser() user: User) {
    return this.productsService.findMyProducts(user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermission('marketplace:write')
  @UseInterceptors(FilesInterceptor('images', 4))
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.update(+id, user, updateProductDto, files || []);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermission('marketplace:write')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.remove(+id, user);
  }
}
