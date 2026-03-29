import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Require one of the specified role names. Usage: @Roles('admin') */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
