import { IsString, IsNumber, Min, IsDate, IsPositive, IsOptional, MinDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({ example: 'WINTER2026' })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
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
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), { message: 'Expiration date must be in the future' })
  expirationDate?: Date;
}
