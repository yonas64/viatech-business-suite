import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}