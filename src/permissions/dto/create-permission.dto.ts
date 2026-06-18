import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'create:posts' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Allows creating posts' })
  @IsOptional()
  @IsString()
  description?: string;
}
