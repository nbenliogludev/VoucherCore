import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function normalizeEmailValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class ActivatePromoCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email addressing claiming the code',
  })
  @Transform(({ value }: { value: unknown }) => normalizeEmailValue(value))
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
