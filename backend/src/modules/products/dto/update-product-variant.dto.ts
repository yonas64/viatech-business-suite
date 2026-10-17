import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  specification?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MinLength(1)
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  vatRate?: number;
}