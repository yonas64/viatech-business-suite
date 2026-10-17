import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CategorySpecificationFieldDto {
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsIn(['text', 'number', 'dimensions'])
  type: 'text' | 'number' | 'dimensions';

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique((field: CategorySpecificationFieldDto) => field.key)
  @ValidateNested({ each: true })
  @Type(() => CategorySpecificationFieldDto)
  specificationFields?: CategorySpecificationFieldDto[];
}
