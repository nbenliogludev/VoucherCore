import { PromoCodesRepository } from './promo-codes.repository';

describe('PromoCodesRepository', () => {
  let repository: PromoCodesRepository;
  const tx = {
    promoCode: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    activation: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn(),
    promoCode: {
      findUnique: jest.fn(),
    },
    activation: {
      count: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PromoCodesRepository(prisma as never);
  });

  it('runs callbacks inside a Prisma transaction', async () => {
    prisma.$transaction.mockImplementation(
      (callback: (client: typeof tx) => Promise<string>) => callback(tx),
    );

    const result = await repository.executeTransaction((receivedTx) => {
      expect(receivedTx).toBe(tx);
      return Promise.resolve('done');
    });

    expect(result).toBe('done');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('finds a promo code by code inside a transaction', async () => {
    const promo = { id: 'promo-1', code: 'SUMMER2026' };
    tx.promoCode.findUnique.mockResolvedValue(promo);

    await expect(
      repository.findByCode(tx as never, 'SUMMER2026'),
    ).resolves.toBe(promo);
    expect(tx.promoCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'SUMMER2026' },
    });
  });

  it('finds a promo code with ordered activation emails', async () => {
    const promo = {
      code: 'SUMMER2026',
      activations: [{ email: 'user@example.com' }],
    };
    prisma.promoCode.findUnique.mockResolvedValue(promo);

    await expect(
      repository.findByCodeWithActivations('SUMMER2026'),
    ).resolves.toBe(promo);
    expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'SUMMER2026' },
      select: {
        code: true,
        activations: {
          select: {
            email: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  });

  it('finds a promo code by id', async () => {
    const promo = { id: 'promo-1', code: 'SUMMER2026' };
    prisma.promoCode.findUnique.mockResolvedValue(promo);

    await expect(repository.findById('promo-1')).resolves.toBe(promo);
    expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
      where: { id: 'promo-1' },
    });
  });

  it('updates a promo code only when the activation limit still allows it', async () => {
    const promo = { id: 'promo-1', activationLimit: 50 };
    prisma.$transaction.mockImplementation(
      (callback: (client: typeof tx) => Promise<typeof promo | null>) =>
        callback(tx),
    );
    tx.promoCode.updateMany.mockResolvedValue({ count: 1 });
    tx.promoCode.findUnique.mockResolvedValue(promo);

    await expect(
      repository.updateIfActivationLimitAllows('promo-1', 50, {
        activationLimit: 50,
      } as never),
    ).resolves.toBe(promo);
    expect(tx.promoCode.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'promo-1',
        currentActivations: { lte: 50 },
      },
      data: { activationLimit: 50 },
    });
    expect(tx.promoCode.findUnique).toHaveBeenCalledWith({
      where: { id: 'promo-1' },
    });
  });

  it('returns null when the activation limit condition no longer matches', async () => {
    prisma.$transaction.mockImplementation(
      (callback: (client: typeof tx) => Promise<null>) => callback(tx),
    );
    tx.promoCode.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.updateIfActivationLimitAllows('promo-1', 50, {
        activationLimit: 50,
      } as never),
    ).resolves.toBeNull();
    expect(tx.promoCode.findUnique).not.toHaveBeenCalled();
  });

  it('returns whether a promo code has activations', async () => {
    prisma.activation.count.mockResolvedValueOnce(2).mockResolvedValueOnce(0);

    await expect(repository.hasActivations('promo-1')).resolves.toBe(true);
    await expect(repository.hasActivations('promo-2')).resolves.toBe(false);
    expect(prisma.activation.count).toHaveBeenNthCalledWith(1, {
      where: { promoCodeId: 'promo-1' },
    });
    expect(prisma.activation.count).toHaveBeenNthCalledWith(2, {
      where: { promoCodeId: 'promo-2' },
    });
  });

  it('increments activations only when the limit has not been reached', async () => {
    tx.promoCode.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(
      repository.incrementActivationCount(tx as never, 'promo-1', 5),
    ).resolves.toBe(true);
    await expect(
      repository.incrementActivationCount(tx as never, 'promo-2', 5),
    ).resolves.toBe(false);
    expect(tx.promoCode.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'promo-1',
        currentActivations: { lt: 5 },
      },
      data: {
        currentActivations: { increment: 1 },
      },
    });
    expect(tx.promoCode.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'promo-2',
        currentActivations: { lt: 5 },
      },
      data: {
        currentActivations: { increment: 1 },
      },
    });
  });

  it('finds an activation by email and promo code', async () => {
    const activation = { id: 'activation-1', email: 'user@example.com' };
    tx.activation.findUnique.mockResolvedValue(activation);

    await expect(
      repository.findActivationByEmail(
        tx as never,
        'promo-1',
        'user@example.com',
      ),
    ).resolves.toBe(activation);
    expect(tx.activation.findUnique).toHaveBeenCalledWith({
      where: {
        email_promoCodeId: {
          email: 'user@example.com',
          promoCodeId: 'promo-1',
        },
      },
    });
  });

  it('creates an activation', async () => {
    const activation = { id: 'activation-1', email: 'user@example.com' };
    const data = { email: 'user@example.com', promoCodeId: 'promo-1' };
    tx.activation.create.mockResolvedValue(activation);

    await expect(repository.createActivation(tx as never, data)).resolves.toBe(
      activation,
    );
    expect(tx.activation.create).toHaveBeenCalledWith({ data });
  });
});
