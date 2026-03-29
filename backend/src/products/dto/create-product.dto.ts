import { IsString, IsNumberString, IsOptional, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumberString()
  price: string; // Enviado como form-data, así que vendrá como string numérico

  @IsNumberString()
  categoryId: string; // Enviado como form-data
}
