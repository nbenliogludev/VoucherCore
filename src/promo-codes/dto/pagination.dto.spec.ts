import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('parses paginate=false as false', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: 'false' },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(false);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('parses paginate=true as true', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: 'true' },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(true);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('keeps boolean query values unchanged', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: false },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(false);
    expect(validateSync(dto)).toHaveLength(0);
  });

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

  it('defaults paginate to true when omitted', () => {
    const dto = plainToInstance(
      PaginationDto,
      {},
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(true);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('treats an explicit undefined paginate value as true', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: undefined },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(true);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('fails validation for invalid paginate values', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: 'sometimes' },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe('sometimes');
    expect(validateSync(dto)).toHaveLength(1);
  });

  it('fails validation for non-string, non-boolean paginate values', () => {
    const dto = plainToInstance(
      PaginationDto,
      { paginate: 1 },
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(1);
    expect(validateSync(dto)).toHaveLength(1);
  });
});
