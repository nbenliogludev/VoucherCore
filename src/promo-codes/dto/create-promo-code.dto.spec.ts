import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreatePromoCodeDto } from './create-promo-code.dto';

describe('CreatePromoCodeDto', () => {
  it('normalizes promo codes and converts primitive values', () => {
    const dto = plainToInstance(
      CreatePromoCodeDto,
      {
        code: '  summer2026  ',
        discountPercentage: '10.5',
        activationLimit: '25',
        expirationDate: '2099-12-31T23:59:59.000Z',
      },
      { enableImplicitConversion: true },
    );

    expect(dto.code).toBe('SUMMER2026');
    expect(dto.discountPercentage).toBe(10.5);
    expect(dto.activationLimit).toBe(25);
    expect(dto.expirationDate).toBeInstanceOf(Date);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects invalid values without changing non-string codes', () => {
    const dto = plainToInstance(CreatePromoCodeDto, {
      code: 12345,
      discountPercentage: 101,
      activationLimit: 0,
      expirationDate: 'invalid-date',
    });

    expect(dto.code).toBe(12345);
    expect(validateSync(dto).length).toBeGreaterThan(0);
  });
});
