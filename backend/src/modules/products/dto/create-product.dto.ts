import {
  IsArray,
  Max,
  ArrayMinSize,
  IsObject,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductVariantDto {
  // Older clients may still provide a single display string here.
  @IsString()
  @IsOptional()
  specification?: string;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  vatRate?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
