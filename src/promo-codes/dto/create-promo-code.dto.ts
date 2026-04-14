import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsDate,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

function normalizePromoCodeValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreatePromoCodeDto {
  @ApiProperty({
    example: 'SUMMER2026',
    description: 'Unique promo code string',
  })
  @Transform(({ value }: { value: unknown }) => normalizePromoCodeValue(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 10.5, description: 'Discount percentage value' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum numeric limit for usages',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  activationLimit: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'ISO Expiration date',
  })
  @Type(() => Date)
  @IsDate()
  expirationDate: Date;
}
