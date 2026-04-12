import { IsString, IsNumber, Min, IsDateString, IsPositive, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({ example: 'WINTER2026' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  activationLimit?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
