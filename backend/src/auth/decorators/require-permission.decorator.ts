import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
/** Require ALL specified permissions. Usage: @RequirePermission('users:read', 'users:write') */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
