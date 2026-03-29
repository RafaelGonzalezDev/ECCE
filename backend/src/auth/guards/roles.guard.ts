import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { User } from '../../users/user.entity';

/**
 * Checks both @Roles() and @RequirePermission() decorators dynamically.
 * If neither is set, access is granted (route is role-agnostic but still JWT-protected).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No role/permission restriction → grant access
    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No autenticado');

    const userRoleNames = user.roles?.map((r) => r.name) ?? [];
    const userPermNames = user.roles?.flatMap((r) =>
      r.permissions?.map((p) => p.name) ?? [],
    ) ?? [];

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((r) => userRoleNames.includes(r));
      if (!hasRole) throw new ForbiddenException('No tienes el rol requerido');
    }

    if (requiredPermissions?.length) {
      const hasPerm = requiredPermissions.every((p) => userPermNames.includes(p));
      if (!hasPerm) throw new ForbiddenException('No tienes el permiso requerido');
    }

    return true;
  }
}
