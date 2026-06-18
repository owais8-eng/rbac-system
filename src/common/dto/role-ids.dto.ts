import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleIdsDto {
  @ApiProperty({ example: [1, 2], description: 'Array of role IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds: number[];
}
