import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdatePromoCodeDto } from './update-promo-code.dto';

describe('UpdatePromoCodeDto', () => {
  it('normalizes provided promo codes and converts optional values', () => {
    const dto = plainToInstance(
      UpdatePromoCodeDto,
      {
        code: '  winter2026 ',
        discountPercentage: '15.25',
        activationLimit: '10',
        expirationDate: '2099-12-31T23:59:59.000Z',
      },
      { enableImplicitConversion: true },
    );

    expect(dto.code).toBe('WINTER2026');
    expect(dto.discountPercentage).toBe(15.25);
    expect(dto.activationLimit).toBe(10);
    expect(dto.expirationDate).toBeInstanceOf(Date);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('keeps missing optional values untouched and flags invalid input', () => {
    const dto = plainToInstance(UpdatePromoCodeDto, {
      code: 9876,
      discountPercentage: 0,
    });

    expect(dto.code).toBe(9876);
    expect(validateSync(dto).length).toBeGreaterThan(0);
  });
});
