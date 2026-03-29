import {
  IsEmail, IsString, MinLength, IsBoolean, IsOptional, Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Nombre mínimo 2 caracteres' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Apellido mínimo 2 caracteres' })
  lastName: string;

  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Contraseña mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe incluir al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe incluir al menos un número' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsBoolean()
  isChurchMember: boolean;

  @IsOptional()
  @IsString()
  churchName?: string;

  @IsBoolean()
  isEntrepreneur: boolean;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  departamento: string;

  @IsString()
  municipio: string;
}
