import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('converts page and limit query params to numbers', () => {
    const dto = plainToInstance(
      PaginationDto,
      { page: '3', limit: '25' },
      { enableImplicitConversion: true },
    );

    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(25);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('defaults page and limit when omitted', () => {
    const dto = plainToInstance(
      PaginationDto,
      {},
      { enableImplicitConversion: true },
    );

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(100);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('fails validation for values outside the allowed numeric bounds', () => {
    const dto = plainToInstance(
      PaginationDto,
      { page: 0, limit: 501 },
      { enableImplicitConversion: true },
    );

    expect(validateSync(dto)).toHaveLength(2);
  });
});
