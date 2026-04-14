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

  it('defaults paginate to true when omitted', () => {
    const dto = plainToInstance(
      PaginationDto,
      {},
      { enableImplicitConversion: true },
    );

    expect(dto.paginate).toBe(true);
    expect(validateSync(dto)).toHaveLength(0);
  });
});
