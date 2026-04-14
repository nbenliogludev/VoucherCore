import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

function parseBooleanQuery(value: unknown): boolean | unknown {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;
  }

  return value;
}

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 100, description: 'Items per page (Max 500)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @ApiPropertyOptional({ example: true, description: 'Set to false to directly extract all database entries' })
  @IsOptional()
  @Transform(({ obj }) => parseBooleanQuery(obj.paginate), { toClassOnly: true })
  @IsBoolean()
  paginate?: boolean = true;
}
