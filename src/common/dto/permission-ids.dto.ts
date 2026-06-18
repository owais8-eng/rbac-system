import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionIdsDto {
  @ApiProperty({ example: [1, 2], description: 'Array of permission IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
