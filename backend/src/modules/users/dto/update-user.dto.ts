import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import type { Role } from '../../../common/decorators/roles.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['admin', 'staff'] as const)
  role?: Role;
}