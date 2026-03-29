import { IsString, IsNumberString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  deletedImageIds?: string[]; // array of strings (publicIds)
}
