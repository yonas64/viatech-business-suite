import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  active = true;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  specificationKey?: string;

  @IsOptional()
  @IsString()
  specificationValue?: string;

  @IsOptional()
  @IsIn(['name', 'createdAt', 'sellingPrice'])
  sortBy: 'name' | 'createdAt' | 'sellingPrice' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

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