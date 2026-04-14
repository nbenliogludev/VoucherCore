import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivatePromoCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email addressing claiming the code',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
