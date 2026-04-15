import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiProperty({ description: 'The unique UUID of the promo code' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The unique string value input by the user' })
  @Expose()
  code: string;

  @ApiProperty({ description: 'The discount percentage this code provides' })
  @Expose()
  discountPercentage: number;

  @ApiProperty({ description: 'How many times this code can be activated' })
  @Expose()
  activationLimit: number;

  @ApiProperty({ description: 'How many activations are still available' })
  @Expose()
  remainingActivations: number;

  @ApiProperty({ description: 'The date and time this code naturally expires' })
  @Expose()
  expirationDate: Date;
}
