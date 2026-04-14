import 'reflect-metadata';

const mockedModules = [
  './promo-codes/promo-codes.service',
  './promo-codes/dto/create-promo-code.dto',
  './promo-codes/dto/pagination.dto',
  './promo-codes/dto/update-promo-code.dto',
  './promo-codes/dto/activate-promo-code.dto',
  './prisma/prisma.service',
  './promo-codes/promo-codes.repository',
  '@nestjs/swagger',
];

describe('Decorator metadata fallbacks', () => {
  const realDate = global.Date;

  afterEach(() => {
    global.Date = realDate;
    jest.resetModules();
    mockedModules.forEach((moduleName) => jest.dontMock(moduleName));
  });

  it('falls back to Object metadata when controller dependencies are unavailable', () => {
    let PromoCodesController: new (...args: unknown[]) => unknown;

    jest.isolateModules(() => {
      jest.doMock('./promo-codes/promo-codes.service', () => ({
        PromoCodesService: undefined,
      }));
      jest.doMock('./promo-codes/dto/create-promo-code.dto', () => ({
        CreatePromoCodeDto: undefined,
      }));
      jest.doMock('./promo-codes/dto/pagination.dto', () => ({
        PaginationDto: undefined,
      }));
      jest.doMock('./promo-codes/dto/update-promo-code.dto', () => ({
        UpdatePromoCodeDto: undefined,
      }));
      jest.doMock('./promo-codes/dto/activate-promo-code.dto', () => ({
        ActivatePromoCodeDto: undefined,
      }));

      ({
        PromoCodesController,
      } = require('./promo-codes/promo-codes.controller'));
    });

    expect(
      Reflect.getMetadata('design:paramtypes', PromoCodesController),
    ).toEqual([Object]);
    expect(
      Reflect.getMetadata(
        'design:paramtypes',
        PromoCodesController.prototype,
        'create',
      ),
    ).toEqual([Object]);
    expect(
      Reflect.getMetadata(
        'design:paramtypes',
        PromoCodesController.prototype,
        'getAll',
      ),
    ).toEqual([Object]);
    expect(
      Reflect.getMetadata(
        'design:paramtypes',
        PromoCodesController.prototype,
        'update',
      ),
    ).toEqual([String, Object]);
    expect(
      Reflect.getMetadata(
        'design:paramtypes',
        PromoCodesController.prototype,
        'activate',
      ),
    ).toEqual([String, Object]);
  });

  it('falls back to Object metadata when repository and service dependencies are unavailable', () => {
    let PromoCodesRepository: new (...args: unknown[]) => unknown;
    let PromoCodesService: new (...args: unknown[]) => unknown;

    jest.isolateModules(() => {
      jest.doMock('./prisma/prisma.service', () => ({
        PrismaService: undefined,
      }));

      ({
        PromoCodesRepository,
      } = require('./promo-codes/promo-codes.repository'));
    });

    jest.resetModules();
    jest.dontMock('./prisma/prisma.service');

    jest.isolateModules(() => {
      jest.doMock('./prisma/prisma.service', () => ({
        PrismaService: undefined,
      }));
      jest.doMock('./promo-codes/promo-codes.repository', () => ({
        PromoCodesRepository: undefined,
      }));

      ({ PromoCodesService } = require('./promo-codes/promo-codes.service'));
    });

    expect(
      Reflect.getMetadata('design:paramtypes', PromoCodesRepository),
    ).toEqual([Object]);
    expect(Reflect.getMetadata('design:paramtypes', PromoCodesService)).toEqual(
      [Object, Object],
    );
  });

  it('falls back to Object metadata for date fields when Date is unavailable', () => {
    let CreatePromoCodeDto: new () => unknown;
    let UpdatePromoCodeDto: new () => unknown;
    let PromoCodeResponseDto: new () => unknown;

    jest.isolateModules(() => {
      jest.doMock('@nestjs/swagger', () => ({
        ApiProperty: () => () => undefined,
        ApiPropertyOptional: () => () => undefined,
      }));
      global.Date = {} as DateConstructor;

      ({
        CreatePromoCodeDto,
      } = require('./promo-codes/dto/create-promo-code.dto'));
      ({
        UpdatePromoCodeDto,
      } = require('./promo-codes/dto/update-promo-code.dto'));
      ({
        PromoCodeResponseDto,
      } = require('./promo-codes/dto/promo-code-response.dto'));
    });

    expect(
      Reflect.getMetadata(
        'design:type',
        CreatePromoCodeDto.prototype,
        'expirationDate',
      ),
    ).toBe(Object);
    expect(
      Reflect.getMetadata(
        'design:type',
        UpdatePromoCodeDto.prototype,
        'expirationDate',
      ),
    ).toBe(Object);
    expect(
      Reflect.getMetadata(
        'design:type',
        PromoCodeResponseDto.prototype,
        'expirationDate',
      ),
    ).toBe(Object);
  });
});
