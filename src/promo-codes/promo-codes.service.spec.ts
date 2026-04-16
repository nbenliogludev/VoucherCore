import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PromoCodesService } from './promo-codes.service';

function buildPromo(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'promo-1',
    code: 'SUMMER2026',
    discountPercentage: 10.5,
    activationLimit: 100,
    currentActivations: 0,
    expirationDate: new Date('2099-12-31T23:59:59.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function createKnownRequestError(code: string) {
  const error = new Error(`Prisma error: ${code}`);
  Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype);

  return Object.assign(error, { code });
}

describe('PromoCodesService', () => {
  let service: PromoCodesService;
  const prisma = {
    promoCode: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const repository = {
    findByCodeWithActivations: jest.fn(),
    findById: jest.fn(),
    updateIfActivationLimitAllows: jest.fn(),
    hasActivations: jest.fn(),
    executeTransaction: jest.fn(),
    findByCode: jest.fn(),
    findActivationByEmail: jest.fn(),
    incrementActivationCount: jest.fn(),
    createActivation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PromoCodesService(prisma as never, repository as never);
  });

  describe('create', () => {
    it('creates a promo code and maps it to the response DTO', async () => {
      const expirationDate = new Date('2099-12-31T23:59:59.000Z');
      prisma.promoCode.create.mockResolvedValue(buildPromo({ expirationDate }));

      await expect(
        service.create({
          code: 'SUMMER2026',
          discountPercentage: 10.5,
          activationLimit: 100,
          expirationDate,
        }),
      ).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 100,
        remainingActivations: 100,
        expirationDate,
      });
      expect(prisma.promoCode.create).toHaveBeenCalledWith({
        data: {
          code: 'SUMMER2026',
          discountPercentage: 10.5,
          activationLimit: 100,
          expirationDate,
        },
      });
    });

    it('rejects promo codes with past expiration dates', async () => {
      const pastDate = new Date(Date.now() - 1_000);

      await expect(
        service.create({
          code: 'SUMMER2026',
          discountPercentage: 10.5,
          activationLimit: 100,
          expirationDate: pastDate,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.promoCode.create).not.toHaveBeenCalled();
    });

    it('converts unique constraint violations into conflicts', async () => {
      prisma.promoCode.create.mockRejectedValue(
        createKnownRequestError('P2002'),
      );

      await expect(
        service.create({
          code: 'SUMMER2026',
          discountPercentage: 10.5,
          activationLimit: 100,
          expirationDate: new Date('2099-12-31T23:59:59.000Z'),
        }),
      ).rejects.toThrow(
        new ConflictException("Promo code 'SUMMER2026' already exists"),
      );
    });

    it('rethrows unknown creation errors', async () => {
      const error = new Error('database unavailable');
      prisma.promoCode.create.mockRejectedValue(error);

      await expect(
        service.create({
          code: 'SUMMER2026',
          discountPercentage: 10.5,
          activationLimit: 100,
          expirationDate: new Date('2099-12-31T23:59:59.000Z'),
        }),
      ).rejects.toBe(error);
    });
  });

  describe('getAll', () => {
    it('uses the default pagination arguments when none are provided', async () => {
      prisma.promoCode.findMany.mockResolvedValue([]);
      prisma.promoCode.count.mockResolvedValue(0);

      await expect(service.getAll()).resolves.toEqual({
        items: [],
        meta: {
          total: 0,
          page: 1,
          limit: 100,
          totalPages: 0,
        },
      });
      expect(prisma.promoCode.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns a paginated promo code list with metadata', async () => {
      prisma.promoCode.findMany.mockResolvedValue([buildPromo()]);
      prisma.promoCode.count.mockResolvedValue(8);

      await expect(service.getAll(3, 2)).resolves.toEqual({
        items: [
          {
            id: 'promo-1',
            code: 'SUMMER2026',
            discountPercentage: 10.5,
            activationLimit: 100,
            remainingActivations: 100,
            expirationDate: new Date('2099-12-31T23:59:59.000Z'),
          },
        ],
        meta: {
          total: 8,
          page: 3,
          limit: 2,
          totalPages: 4,
        },
      });
      expect(prisma.promoCode.findMany).toHaveBeenCalledWith({
        skip: 4,
        take: 2,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.promoCode.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('returns a promo code by id', async () => {
      prisma.promoCode.findUnique.mockResolvedValue(buildPromo());

      await expect(service.findOne('promo-1')).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 100,
        remainingActivations: 100,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
      expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
        where: { id: 'promo-1' },
      });
    });

    it('throws when the promo code does not exist', async () => {
      prisma.promoCode.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getActivationEmailsByCode', () => {
    it('returns activation emails for a promo code using a normalized code', async () => {
      repository.findByCodeWithActivations.mockResolvedValue({
        code: 'SUMMER2026',
        activations: [
          { email: 'second@example.com' },
          { email: 'first@example.com' },
        ],
      });

      await expect(
        service.getActivationEmailsByCode('  summer2026 '),
      ).resolves.toEqual({
        code: 'SUMMER2026',
        emails: ['second@example.com', 'first@example.com'],
        totalActivations: 2,
      });
      expect(repository.findByCodeWithActivations).toHaveBeenCalledWith(
        'SUMMER2026',
      );
    });

    it('throws when the promo code has no activations record', async () => {
      repository.findByCodeWithActivations.mockResolvedValue(null);

      await expect(
        service.getActivationEmailsByCode('missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('rejects invalid expiration dates', async () => {
      await expect(
        service.update('promo-1', {
          expirationDate: new Date(Date.now() - 1_000),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.promoCode.update).not.toHaveBeenCalled();
    });

    it('updates promo codes directly when the code field is omitted', async () => {
      prisma.promoCode.update.mockResolvedValue(
        buildPromo({ discountPercentage: 15 }),
      );

      await expect(
        service.update('promo-1', { discountPercentage: 15 }),
      ).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 15,
        activationLimit: 100,
        remainingActivations: 100,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
      expect(repository.findById).not.toHaveBeenCalled();
      expect(prisma.promoCode.update).toHaveBeenCalledWith({
        where: { id: 'promo-1' },
        data: { discountPercentage: 15 },
      });
    });

    it('throws when updating the code of a missing promo code', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { code: 'WINTER2026' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates promo codes when the code remains unchanged', async () => {
      repository.findById.mockResolvedValue(buildPromo({ code: 'SUMMER2026' }));
      prisma.promoCode.update.mockResolvedValue(buildPromo());

      await expect(
        service.update('promo-1', { code: 'SUMMER2026' }),
      ).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 100,
        remainingActivations: 100,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
      expect(repository.hasActivations).not.toHaveBeenCalled();
    });

    it('prevents code changes once activations exist', async () => {
      repository.findById.mockResolvedValue(buildPromo({ code: 'SUMMER2026' }));
      repository.hasActivations.mockResolvedValue(true);

      await expect(
        service.update('promo-1', { code: 'WINTER2026' }),
      ).rejects.toThrow(
        new ConflictException(
          'Cannot change promo code after it has been activated',
        ),
      );
      expect(repository.hasActivations).toHaveBeenCalledWith('promo-1');
    });

    it('allows code changes when there are no activations', async () => {
      repository.findById.mockResolvedValue(buildPromo({ code: 'SUMMER2026' }));
      repository.hasActivations.mockResolvedValue(false);
      prisma.promoCode.update.mockResolvedValue(
        buildPromo({ code: 'WINTER2026' }),
      );

      await expect(
        service.update('promo-1', { code: 'WINTER2026' }),
      ).resolves.toEqual({
        id: 'promo-1',
        code: 'WINTER2026',
        discountPercentage: 10.5,
        activationLimit: 100,
        remainingActivations: 100,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
      expect(repository.hasActivations).toHaveBeenCalledWith('promo-1');
    });

    it('prevents lowering the activation limit below current activations', async () => {
      repository.updateIfActivationLimitAllows.mockResolvedValue(null);
      repository.findById.mockResolvedValue(
        buildPromo({ currentActivations: 50 }),
      );

      await expect(
        service.update('promo-1', { activationLimit: 1 }),
      ).rejects.toThrow(
        new ConflictException(
          'Activation limit cannot be lower than current activations',
        ),
      );
      expect(prisma.promoCode.update).not.toHaveBeenCalled();
      expect(repository.updateIfActivationLimitAllows).toHaveBeenCalledWith(
        'promo-1',
        1,
        { activationLimit: 1 },
      );
    });

    it('throws not found when the atomic activation-limit update cannot find the promo code', async () => {
      repository.updateIfActivationLimitAllows.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { activationLimit: 50 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('uses an atomic conditional update when activationLimit is provided', async () => {
      repository.updateIfActivationLimitAllows.mockResolvedValue(
        buildPromo({ activationLimit: 50 }),
      );

      await expect(
        service.update('promo-1', { activationLimit: 50 }),
      ).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 50,
        remainingActivations: 50,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
      expect(repository.updateIfActivationLimitAllows).toHaveBeenCalledWith(
        'promo-1',
        50,
        { activationLimit: 50 },
      );
      expect(prisma.promoCode.update).not.toHaveBeenCalled();
    });

    it('clamps remaining activations at zero for over-activated legacy data', async () => {
      prisma.promoCode.findUnique.mockResolvedValue(
        buildPromo({ activationLimit: 5, currentActivations: 8 }),
      );

      await expect(service.findOne('promo-1')).resolves.toEqual({
        id: 'promo-1',
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 5,
        remainingActivations: 0,
        expirationDate: new Date('2099-12-31T23:59:59.000Z'),
      });
    });

    it('maps known Prisma update errors to HTTP exceptions', async () => {
      prisma.promoCode.update
        .mockRejectedValueOnce(createKnownRequestError('P2025'))
        .mockRejectedValueOnce(createKnownRequestError('P2002'));

      await expect(
        service.update('missing', { discountPercentage: 15 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.update('promo-1', { discountPercentage: 15 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rethrows unknown update errors', async () => {
      const error = new Error('unexpected update failure');
      prisma.promoCode.update.mockRejectedValue(error);

      await expect(
        service.update('promo-1', { discountPercentage: 15 }),
      ).rejects.toBe(error);
    });

    it('rethrows unhandled Prisma update errors', async () => {
      const error = createKnownRequestError('P9999');
      prisma.promoCode.update.mockRejectedValue(error);

      await expect(
        service.update('promo-1', { discountPercentage: 15 }),
      ).rejects.toBe(error);
    });
  });

  describe('remove', () => {
    it('deletes promo codes', async () => {
      prisma.promoCode.delete.mockResolvedValue(undefined);

      await expect(service.remove('promo-1')).resolves.toBeUndefined();
      expect(prisma.promoCode.delete).toHaveBeenCalledWith({
        where: { id: 'promo-1' },
      });
    });

    it('maps known Prisma delete errors to HTTP exceptions', async () => {
      prisma.promoCode.delete
        .mockRejectedValueOnce(createKnownRequestError('P2025'))
        .mockRejectedValueOnce(createKnownRequestError('P2003'));

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(service.remove('promo-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows unknown delete errors', async () => {
      const error = new Error('unexpected delete failure');
      prisma.promoCode.delete.mockRejectedValue(error);

      await expect(service.remove('promo-1')).rejects.toBe(error);
    });

    it('rethrows unhandled Prisma delete errors', async () => {
      const error = createKnownRequestError('P9999');
      prisma.promoCode.delete.mockRejectedValue(error);

      await expect(service.remove('promo-1')).rejects.toBe(error);
    });
  });

  describe('activatePromo', () => {
    const tx = { tag: 'transaction-client' };

    beforeEach(() => {
      repository.executeTransaction.mockImplementation(
        async (callback: (client: unknown) => Promise<unknown>) => callback(tx),
      );
    });

    it('throws when the promo code is missing', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(
        service.activatePromo('summer2026', { email: 'user@example.com' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.findByCode).toHaveBeenCalledWith(tx, 'SUMMER2026');
    });

    it('throws when the promo code has expired', async () => {
      repository.findByCode.mockResolvedValue(
        buildPromo({ expirationDate: new Date('2000-01-01T00:00:00.000Z') }),
      );

      await expect(
        service.activatePromo('summer2026', { email: 'user@example.com' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when the email already activated the promo code', async () => {
      repository.findByCode.mockResolvedValue(buildPromo());
      repository.findActivationByEmail.mockResolvedValue({
        id: 'activation-1',
      });

      await expect(
        service.activatePromo('summer2026', { email: 'User@Example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.findActivationByEmail).toHaveBeenCalledWith(
        tx,
        'promo-1',
        'user@example.com',
      );
    });

    it('throws when the activation limit has been reached', async () => {
      repository.findByCode.mockResolvedValue(buildPromo());
      repository.findActivationByEmail.mockResolvedValue(null);
      repository.incrementActivationCount.mockResolvedValue(false);

      await expect(
        service.activatePromo('summer2026', { email: 'user@example.com' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.incrementActivationCount).toHaveBeenCalledWith(
        tx,
        'promo-1',
        100,
      );
    });

    it('maps duplicate activation insert races to a conflict response', async () => {
      repository.findByCode.mockResolvedValue(buildPromo());
      repository.findActivationByEmail.mockResolvedValue(null);
      repository.incrementActivationCount.mockResolvedValue(true);
      repository.createActivation.mockRejectedValue(
        createKnownRequestError('P2002'),
      );

      await expect(
        service.activatePromo('summer2026', { email: 'user@example.com' }),
      ).rejects.toThrow(
        new ConflictException('You have already activated this promo code'),
      );
    });

    it('creates an activation when all checks pass', async () => {
      repository.findByCode.mockResolvedValue(buildPromo());
      repository.findActivationByEmail.mockResolvedValue(null);
      repository.incrementActivationCount.mockResolvedValue(true);
      repository.createActivation.mockResolvedValue({ id: 'activation-1' });

      await expect(
        service.activatePromo('summer2026', { email: ' User@Example.com ' }),
      ).resolves.toEqual({
        message: 'Promo code activated successfully',
        promoCode: {
          id: 'promo-1',
          code: 'SUMMER2026',
        },
      });
      expect(repository.createActivation).toHaveBeenCalledWith(tx, {
        email: 'user@example.com',
        promoCodeId: 'promo-1',
      });
    });
  });
});
