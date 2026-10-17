import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  category: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  receiptUrl?: string;
}