import { IsString, IsNotEmpty, IsNumber, Min, IsDateString, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER2026', description: 'Unique promo code string' })
  @IsString()
  @IsNotEmpty()
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
  @IsDateString()
  expirationDate: string;
}
