const dotenvConfigMock = jest.fn();
const poolConstructorMock = jest.fn();
const prismaPgConstructorMock = jest.fn();
const prismaClientConstructorMock = jest.fn();
const connectMock = jest.fn();
const disconnectMock = jest.fn();

jest.mock('dotenv', () => ({
  config: dotenvConfigMock,
}));

jest.mock('pg', () => ({
  Pool: class Pool {
    options: unknown;

    constructor(options: unknown) {
      this.options = options;
      poolConstructorMock(options);
    }
  },
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class PrismaPg {
    pool: unknown;

    constructor(pool: unknown) {
      this.pool = pool;
      prismaPgConstructorMock(pool);
    }
  },
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {
    constructor(options?: unknown) {
      prismaClientConstructorMock(options);
    }

    $connect = connectMock;
    $disconnect = disconnectMock;
  },
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/app';
  });

  afterAll(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
      return;
    }

    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('constructs PrismaClient with a PostgreSQL adapter backed by the database pool', () => {
    const service = new PrismaService();

    expect(service).toBeInstanceOf(PrismaService);
    expect(poolConstructorMock).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
    });
    expect(prismaPgConstructorMock).toHaveBeenCalledTimes(1);
    expect(prismaClientConstructorMock).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        pool: expect.objectContaining({
          options: {
            connectionString: process.env.DATABASE_URL,
          },
        }),
      }),
    });
  });

  it('connects on module init', async () => {
    const service = new PrismaService();

    await service.onModuleInit();

    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('disconnects on module destroy', async () => {
    const service = new PrismaService();

    await service.onModuleDestroy();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
