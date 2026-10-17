import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class StockMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class AdjustStockDto extends StockMovementDto {
  // quantity is the verified count now physically on hand (not a delta).
}
