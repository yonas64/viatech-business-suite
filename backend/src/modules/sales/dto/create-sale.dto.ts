import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsMongoId()
  productId: string;

  @IsMongoId()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsOptional()
  @IsEnum(['cash', 'card', 'bank-transfer', 'other'])
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'other';

  @IsOptional()
  @IsEnum(['paid', 'pending'])
  paymentStatus?: 'paid' | 'pending';
}
