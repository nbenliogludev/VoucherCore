import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeActivationEmailsResponseDto {
  @ApiProperty({ example: 'SUMMER2026', description: 'Promo code value' })
  code: string;

  @ApiProperty({
    example: ['user1@example.com', 'user2@example.com'],
    description: 'Emails that activated this promo code',
    type: [String],
  })
  emails: string[];

  @ApiProperty({
    example: 2,
    description: 'Total number of activations for this promo code',
  })
  totalActivations: number;
}
