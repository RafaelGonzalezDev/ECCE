import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/entities/product.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  UpdateUserAdminDto, CreateUserAdminDto, AssignRolesDto,
  CreateRoleDto, UpdateRoleDto, CreatePermissionDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)       private usersRepo: Repository<User>,
    @InjectRepository(Role)       private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
    @InjectRepository(Category)   private catsRepo: Repository<Category>,
    @InjectRepository(Product)    private productsRepo: Repository<Product>,
    private cloudinary: CloudinaryService,
  ) {}

  // ─── Dashboard Stats ────────────────────────────────────────────────────────
  async getStats() {
    const [totalUsers, activeUsers, totalProducts, activeProducts, totalRoles, totalCategories] =
      await Promise.all([
        this.usersRepo.count(),
        this.usersRepo.count({ where: { isActive: true } }),
        this.productsRepo.count(),
        this.productsRepo.count({ where: { isActive: true } }),
        this.rolesRepo.count(),
        this.catsRepo.count(),
      ]);
    return { totalUsers, activeUsers, totalProducts, activeProducts, totalRoles, totalCategories };
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  async findAllUsers() {
    return this.usersRepo.find({
      relations: ['roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUserById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async createUser(dto: CreateUserAdminDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Ya existe una cuenta con ese correo.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const roles = dto.roleIds?.length
      ? await this.rolesRepo.findByIds(dto.roleIds)
      : [await this.rolesRepo.findOne({ where: { name: 'user' } })];
    const user = this.usersRepo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      phone: dto.phone?.trim() || null,
      isChurchMember: dto.isChurchMember ?? false,
      churchName: dto.isChurchMember ? dto.churchName?.trim() || null : null,
      isEntrepreneur: dto.isEntrepreneur ?? false,
      businessName: dto.isEntrepreneur ? dto.businessName?.trim() || null : null,
      departamento: dto.departamento,
      municipio: dto.municipio,
      roles: roles.filter(Boolean) as Role[],
    });
    return this.usersRepo.save(user);
  }

  async updateUser(id: number, dto: UpdateUserAdminDto) {
    const user = await this.findUserById(id);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async toggleUserActive(id: number) {
    const user = await this.findUserById(id);
    user.isActive = !user.isActive;
    await this.usersRepo.save(user);
    return { id: user.id, isActive: user.isActive };
  }

  async assignRolesToUser(id: number, dto: AssignRolesDto) {
    const user = await this.findUserById(id);
    const roles = await this.rolesRepo.findByIds(dto.roleIds);
    user.roles = roles;
    return this.usersRepo.save(user);
  }

  // ─── Roles ──────────────────────────────────────────────────────────────────
  async findAllRoles() {
    return this.rolesRepo.find({ relations: ['permissions'], order: { name: 'ASC' } });
  }

  async createRole(dto: CreateRoleDto) {
    const exists = await this.rolesRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Ya existe un rol con el nombre "${dto.name}"`);
    const permissions = dto.permissionIds?.length
      ? await this.permsRepo.findByIds(dto.permissionIds)
      : [];
    const role = this.rolesRepo.create({
      name: dto.name,
      description: dto.description || null,
      isSystem: false,
      permissions,
    });
    return this.rolesRepo.save(role);
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.rolesRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description || null;
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds.length
        ? await this.permsRepo.findByIds(dto.permissionIds)
        : [];
    }
    return this.rolesRepo.save(role);
  }

  async deleteRole(id: number) {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.isSystem) throw new BadRequestException('No se pueden eliminar roles del sistema');
    await this.rolesRepo.remove(role);
    return { message: 'Rol eliminado' };
  }

  // ─── Permissions ────────────────────────────────────────────────────────────
  async findAllPermissions() {
    return this.permsRepo.find({ order: { module: 'ASC', action: 'ASC' } });
  }

  async createPermission(dto: CreatePermissionDto) {
    const exists = await this.permsRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Permiso "${dto.name}" ya existe`);
    const perm = this.permsRepo.create(dto);
    return this.permsRepo.save(perm);
  }

  async deletePermission(id: number) {
    const perm = await this.permsRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permiso no encontrado');
    await this.permsRepo.remove(perm);
    return { message: 'Permiso eliminado' };
  }

  // ─── Categories ─────────────────────────────────────────────────────────────
  async findAllCategories() {
    return this.catsRepo.find({ order: { name: 'ASC' } });
  }

  async createCategory(data: { name: string; slug: string }) {
    const exists = await this.catsRepo.findOne({ where: { slug: data.slug } });
    if (exists) throw new ConflictException('Ya existe una categoría con ese slug');
    return this.catsRepo.save(this.catsRepo.create(data));
  }

  async updateCategory(id: number, data: Partial<{ name: string; slug: string; isActive: boolean }>) {
    const cat = await this.catsRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    Object.assign(cat, data);
    return this.catsRepo.save(cat);
  }

  async deleteCategory(id: number) {
    const cat = await this.catsRepo.findOne({ where: { id }, relations: ['products'] });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    // Check if any products are using this category
    if (cat.products && cat.products.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría "${cat.name}" porque tiene ${cat.products.length} producto(s) asociado(s). Reasigna o elimina esos productos primero.`
      );
    }
    try {
      await this.catsRepo.remove(cat);
    } catch (err: any) {
      // FK constraint fallback
      if (err?.code === 'ER_ROW_IS_REFERENCED_2' || err?.errno === 1451) {
        throw new BadRequestException(
          `No se puede eliminar la categoría "${cat.name}" porque está siendo usada por productos del sistema.`
        );
      }
      throw err;
    }
    return { message: `Categoría "${cat.name}" eliminada correctamente` };
  }

  // ─── Products ───────────────────────────────────────────────────────────────
  async findAllProducts() {
    return this.productsRepo.find({
      relations: ['seller', 'category', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async adminSoftDeleteProduct(id: number) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Soft delete: keep data but remove Cloudinary images to save resources
    if (product.images?.length) {
      await Promise.allSettled(
        product.images.map(img => this.cloudinary.deleteImage(img.publicId))
      );
      product.images.forEach(img => { img.url = ''; img.publicId = ''; });
    }
    product.isActive = false;
    await this.productsRepo.save(product);
    return { message: 'Producto desactivado y sus imágenes eliminadas de Cloudinary' };
  }
}
