import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/category.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../users/user.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private imagesRepo: Repository<ProductImage>,
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(user: User, dto: CreateProductDto, files: Express.Multer.File[]) {
    const category = await this.categoriesRepo.findOne({ where: { id: Number(dto.categoryId) } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    // Subir imágenes concurrentemente
    const uploadPromises = files.map((file) => this.cloudinaryService.uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    const productImages = uploadResults.map((res) => {
      const img = new ProductImage();
      img.url = res.secure_url;
      img.publicId = res.public_id;
      return img;
    });

    const product = this.productsRepo.create({
      title: dto.title,
      description: dto.description || null,
      price: parseFloat(dto.price),
      seller: user,
      category,
      images: productImages,
    });

    return this.productsRepo.save(product);
  }

  async findAll() {
    return this.productsRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyProducts(user: User) {
    return this.productsRepo.find({
      where: { seller: { id: user.id }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, user: User, dto: any, newFiles: Express.Multer.File[]) {
    const product = await this.productsRepo.findOne({ 
      where: { id, seller: { id: user.id } },
      relations: ['images']
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (dto.title) product.title = dto.title;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price) product.price = parseFloat(dto.price);
    
    if (dto.categoryId) {
      const category = await this.categoriesRepo.findOne({ where: { id: Number(dto.categoryId) } });
      if (category) product.category = category;
    }

    // Process Image Delections
    let remainingImages = product.images || [];
    if (dto.deletedImageIds) {
      const idsToDelete = Array.isArray(dto.deletedImageIds) ? dto.deletedImageIds : [dto.deletedImageIds];
      
      const imagesToDelete = remainingImages.filter(img => idsToDelete.includes(img.publicId));
      remainingImages = remainingImages.filter(img => !idsToDelete.includes(img.publicId));

      // Remueve de BD y Cloudinary
      if (imagesToDelete.length > 0) {
        await this.imagesRepo.remove(imagesToDelete);
        const delPromises = imagesToDelete.map(img => this.cloudinaryService.deleteImage(img.publicId));
        await Promise.all(delPromises);
      }
    }

    // Protect max images cap
    if (remainingImages.length + newFiles.length > 4) {
      throw new Error('Un producto no puede exceder las 4 imágenes.');
    }

    // Upload New Images
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map(file => this.cloudinaryService.uploadImage(file));
      const res = await Promise.all(uploadPromises);
      
      const freshImages = res.map(r => {
        const img = new ProductImage();
        img.url = r.secure_url;
        img.publicId = r.public_id;
        return img;
      });

      remainingImages = [...remainingImages, ...freshImages];
    }

    product.images = remainingImages;

    return this.productsRepo.save(product);
  }

  async remove(id: number, user: User) {
    const product = await this.productsRepo.findOne({ where: { id, seller: { id: user.id } } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Primero borramos de Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((img) => this.cloudinaryService.deleteImage(img.publicId));
      await Promise.all(deletePromises);
    }

    await this.productsRepo.remove(product);
    return { message: 'Producto borrado exitosamente' };
  }
}
