import {
  Controller, Get, Post, Patch, Delete,
  Param, ParseIntPipe, Body, UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  UpdateUserAdminDto, CreateUserAdminDto, AssignRolesDto,
  CreateRoleDto, UpdateRoleDto, CreatePermissionDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────
  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  // ─── Users ───────────────────────────────────────────────────────────────
  @Get('users')
  findAllUsers() { return this.adminService.findAllUsers(); }

  @Get('users/:id')
  findUser(@Param('id', ParseIntPipe) id: number) { return this.adminService.findUserById(id); }

  @Post('users')
  createUser(@Body() dto: CreateUserAdminDto) { return this.adminService.createUser(dto); }

  @Patch('users/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserAdminDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserActive(id);
  }

  @Patch('users/:id/roles')
  assignRoles(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRolesDto) {
    return this.adminService.assignRolesToUser(id, dto);
  }

  // ─── Roles ───────────────────────────────────────────────────────────────
  @Get('roles')
  findAllRoles() { return this.adminService.findAllRoles(); }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) { return this.adminService.createRole(dto); }

  @Patch('roles/:id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id', ParseIntPipe) id: number) { return this.adminService.deleteRole(id); }

  // ─── Permissions ─────────────────────────────────────────────────────────
  @Get('permissions')
  findAllPermissions() { return this.adminService.findAllPermissions(); }

  @Post('permissions')
  createPermission(@Body() dto: CreatePermissionDto) { return this.adminService.createPermission(dto); }

  @Delete('permissions/:id')
  deletePermission(@Param('id', ParseIntPipe) id: number) { return this.adminService.deletePermission(id); }

  // ─── Categories ──────────────────────────────────────────────────────────
  @Get('categories')
  findAllCategories() { return this.adminService.findAllCategories(); }

  @Post('categories')
  createCategory(@Body() body: { name: string; slug: string }) { return this.adminService.createCategory(body); }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) { return this.adminService.deleteCategory(id); }

  // ─── Products ────────────────────────────────────────────────────────────
  @Get('products')
  findAllProducts() { return this.adminService.findAllProducts(); }

  @Delete('products/:id')
  softDeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.adminSoftDeleteProduct(id);
  }
}
