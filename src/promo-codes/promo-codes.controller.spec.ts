import { PromoCodesController } from './promo-codes.controller';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

describe('PromoCodesController', () => {
  let controller: PromoCodesController;
  const service = {
    create: jest.fn(),
    getAll: jest.fn(),
    getActivationEmailsByCode: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    activatePromo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PromoCodesController(service as never);
  });

  it('delegates promo code creation to the service', async () => {
    const dto = {
      code: 'SUMMER2026',
      discountPercentage: 10.5,
      activationLimit: 100,
      expirationDate: new Date('2099-12-31T23:59:59.000Z'),
    } as CreatePromoCodeDto;
    const expected = { id: 'promo-1', remainingActivations: 100, ...dto };
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toEqual(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates promo code listing to the service', async () => {
    const expected = { items: [], meta: { total: 0, page: 3, limit: 2 } };
    service.getAll.mockResolvedValue(expected);

    await expect(controller.getAll({ page: 3, limit: 2 })).resolves.toEqual(
      expected,
    );
    expect(service.getAll).toHaveBeenCalledWith(3, 2);
  });

  it('delegates activation-email lookup to the service', async () => {
    const expected = {
      code: 'SUMMER2026',
      emails: ['user@example.com'],
      totalActivations: 1,
    };
    service.getActivationEmailsByCode.mockResolvedValue(expected);

    await expect(
      controller.findActivationEmails('SUMMER2026'),
    ).resolves.toEqual(expected);
    expect(service.getActivationEmailsByCode).toHaveBeenCalledWith(
      'SUMMER2026',
    );
  });

  it('delegates promo code lookup by id to the service', async () => {
    const expected = {
      id: 'promo-1',
      code: 'SUMMER2026',
      remainingActivations: 100,
    };
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne('promo-1')).resolves.toEqual(expected);
    expect(service.findOne).toHaveBeenCalledWith('promo-1');
  });

  it('delegates promo code updates to the service', async () => {
    const dto = { code: 'WINTER2026' } as UpdatePromoCodeDto;
    const expected = {
      id: 'promo-1',
      code: 'WINTER2026',
      remainingActivations: 100,
    };
    service.update.mockResolvedValue(expected);

    await expect(controller.update('promo-1', dto)).resolves.toEqual(expected);
    expect(service.update).toHaveBeenCalledWith('promo-1', dto);
  });

  it('delegates promo code deletion to the service', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove('promo-1')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith('promo-1');
  });

  it('delegates promo code activation to the service', async () => {
    const dto = { email: 'user@example.com' } as ActivatePromoCodeDto;
    const expected = {
      message: 'Promo code activated successfully',
      promoCode: { id: 'promo-1', code: 'SUMMER2026' },
    };
    service.activatePromo.mockResolvedValue(expected);

    await expect(controller.activate('SUMMER2026', dto)).resolves.toEqual(
      expected,
    );
    expect(service.activatePromo).toHaveBeenCalledWith('SUMMER2026', dto);
  });
});
