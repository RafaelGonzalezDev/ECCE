import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserAdminDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsBoolean() isChurchMember?: boolean;
  @IsOptional() @IsString() churchName?: string | null;
  @IsOptional() @IsBoolean() isEntrepreneur?: boolean;
  @IsOptional() @IsString() businessName?: string | null;
  @IsOptional() @IsString() departamento?: string;
  @IsOptional() @IsString() municipio?: string;
}

export class CreateUserAdminDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsBoolean() isChurchMember?: boolean;
  @IsOptional() @IsString() churchName?: string;
  @IsOptional() @IsBoolean() isEntrepreneur?: boolean;
  @IsOptional() @IsString() businessName?: string;
  @IsString() departamento: string;
  @IsString() municipio: string;
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) @Type(() => Number) roleIds?: number[];
}

export class AssignRolesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  roleIds: number[];
}

export class CreateRoleDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) @Type(() => Number) permissionIds?: number[];
}

export class UpdateRoleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) @Type(() => Number) permissionIds?: number[];
}

export class CreatePermissionDto {
  @IsString() name: string;
  @IsString() module: string;
  @IsString() action: string;
  @IsOptional() @IsString() description?: string;
}
