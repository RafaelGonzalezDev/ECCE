import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../permissions/permission.entity';
import { Role } from '../../roles/role.entity';
import { Category } from '../../categories/category.entity';

/**
 * SeedService runs automatically on every app bootstrap.
 * It is idempotent — it only creates records that don't exist yet.
 * This way the DB is always ready without manual SQL inserts.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Permission)
    private permissionsRepo: Repository<Permission>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedCategories();
    this.logger.log('✅ Database seed completed.');
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  private readonly CATEGORIES = [
    { name: 'Diseño', slug: 'diseno' },
    { name: 'Desarrollo Web', slug: 'desarrollo-web' },
    { name: 'Tecnología', slug: 'tecnologia' },
    { name: 'Marketing', slug: 'marketing' },
  ];

  private async seedCategories() {
    for (const cat of this.CATEGORIES) {
      const exists = await this.categoriesRepo.findOne({ where: { slug: cat.slug } });
      if (!exists) {
        await this.categoriesRepo.save(this.categoriesRepo.create(cat));
        this.logger.log(`  Created category: ${cat.name}`);
      }
    }
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  private readonly PERMISSIONS = [
    // Users module
    { name: 'users:read',   module: 'users',       action: 'read',   description: 'Ver listado y perfiles de usuarios' },
    { name: 'users:write',  module: 'users',       action: 'write',  description: 'Crear y editar usuarios' },
    { name: 'users:delete', module: 'users',       action: 'delete', description: 'Eliminar usuarios' },
    // Roles & Permissions module
    { name: 'roles:read',   module: 'roles',       action: 'read',   description: 'Ver roles y permisos' },
    { name: 'roles:write',  module: 'roles',       action: 'write',  description: 'Crear y editar roles' },
    { name: 'roles:delete', module: 'roles',       action: 'delete', description: 'Eliminar roles' },
    // Marketplace module
    { name: 'marketplace:read',   module: 'marketplace', action: 'read',   description: 'Ver productos del marketplace' },
    { name: 'marketplace:write',  module: 'marketplace', action: 'write',  description: 'Crear y editar productos' },
    { name: 'marketplace:delete', module: 'marketplace', action: 'delete', description: 'Eliminar productos' },
    // Messages / Chat module
    { name: 'messages:read',  module: 'messages', action: 'read',  description: 'Leer mensajes' },
    { name: 'messages:write', module: 'messages', action: 'write', description: 'Enviar mensajes' },
    // Profile module
    { name: 'profile:read',  module: 'profile', action: 'read',  description: 'Ver perfil propio' },
    { name: 'profile:write', module: 'profile', action: 'write', description: 'Editar perfil propio' },
    // Store module
    { name: 'store:read',  module: 'store', action: 'read',  description: 'Ver tienda' },
    { name: 'store:write', module: 'store', action: 'write', description: 'Administrar tienda' },
    // Settings module
    { name: 'settings:read',  module: 'settings', action: 'read',  description: 'Ver configuración' },
    { name: 'settings:write', module: 'settings', action: 'write', description: 'Cambiar configuración' },
    // Admin module (exclusive to admin role)
    { name: 'admin:access', module: 'admin', action: 'access', description: 'Acceso al panel de administración' },
    { name: 'admin:users',  module: 'admin', action: 'users',  description: 'Gestionar usuarios desde el panel' },
    { name: 'admin:roles',  module: 'admin', action: 'roles',  description: 'Gestionar roles y permisos' },
  ];

  private async seedPermissions() {
    for (const perm of this.PERMISSIONS) {
      const exists = await this.permissionsRepo.findOne({ where: { name: perm.name } });
      if (!exists) {
        await this.permissionsRepo.save(this.permissionsRepo.create(perm));
        this.logger.log(`  Created permission: ${perm.name}`);
      }
    }
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  private async seedRoles() {
    const allPermissions = await this.permissionsRepo.find();

    // Admin role — has ALL permissions
    await this.upsertRole({
      name: 'admin',
      description: 'Administrador del sistema — acceso total',
      isSystem: true,
      permissions: allPermissions,
    });

    // Regular user — can read marketplace, manage own profile/store, use chat
    const userPermNames = [
      'marketplace:read',
      'messages:read', 'messages:write',
      'profile:read', 'profile:write',
      'store:read', 'store:write',
      'settings:read', 'settings:write',
    ];
    const userPerms = allPermissions.filter((p) => userPermNames.includes(p.name));
    await this.upsertRole({
      name: 'user',
      description: 'Usuario registrado — permisos básicos',
      isSystem: true,
      permissions: userPerms,
    });

    // Entrepreneur role — all user permissions + marketplace write
    const entrepreneurPermNames = [
      ...userPermNames,
      'marketplace:write',
    ];
    const entrepreneurPerms = allPermissions.filter((p) =>
      entrepreneurPermNames.includes(p.name),
    );
    await this.upsertRole({
      name: 'entrepreneur',
      description: 'Emprendedor — puede publicar productos en el marketplace',
      isSystem: false,
      permissions: entrepreneurPerms,
    });
  }

  private async upsertRole(data: {
    name: string;
    description: string;
    isSystem: boolean;
    permissions: Permission[];
  }) {
    let role = await this.rolesRepo.findOne({
      where: { name: data.name },
      relations: ['permissions'],
    });

    if (!role) {
      role = this.rolesRepo.create({
        name: data.name,
        description: data.description,
        isSystem: data.isSystem,
        permissions: data.permissions,
      });
      await this.rolesRepo.save(role);
      this.logger.log(`  Created role: ${data.name}`);
    } else {
      // Update permissions if role exists but permissions changed
      role.permissions = data.permissions;
      await this.rolesRepo.save(role);
    }
  }
}
