import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class StockQueryDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsMongoId()
  variantId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class MovementQueryDto extends StockQueryDto {
  @IsOptional()
  @IsIn(['in', 'out', 'sale', 'adjustment'])
  movementType?: 'in' | 'out' | 'sale' | 'adjustment';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}