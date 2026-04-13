import { IsString, IsNotEmpty, IsNumber, Min, IsDate, IsPositive, MaxLength, IsOptional, MinDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER2026', description: 'Unique promo code string' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 10.5, description: 'Discount percentage value' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  discountPercentage: number;

  @ApiProperty({ example: 100, description: 'Maximum numeric limit for usages' })
  @IsNumber()
  @Min(1)
  activationLimit: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'ISO Expiration date' })
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), { message: 'Expiration date must be in the future' })
  expirationDate: Date;
}
