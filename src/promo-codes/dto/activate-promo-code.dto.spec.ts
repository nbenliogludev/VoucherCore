import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ActivatePromoCodeDto } from './activate-promo-code.dto';

describe('ActivatePromoCodeDto', () => {
  it('accepts valid email addresses and normalizes them', () => {
    const dto = plainToInstance(ActivatePromoCodeDto, {
      email: '  User@Example.com  ',
    });

    expect(dto.email).toBe('user@example.com');
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects invalid email addresses', () => {
    const dto = plainToInstance(ActivatePromoCodeDto, {
      email: 'not-an-email',
    });

    expect(validateSync(dto)).toHaveLength(1);
  });
});
