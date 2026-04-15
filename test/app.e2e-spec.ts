import { Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PromoCodesController } from '../src/promo-codes/promo-codes.controller';
import { PromoCodesService } from '../src/promo-codes/promo-codes.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

type SuccessResponse<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

type ErrorResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  path: string;
};

describe('PromoCodesController (e2e)', () => {
  let app: INestApplication;
  const promoCodesService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getActivationEmailsByCode: jest.fn(),
  };

  @Module({
    controllers: [PromoCodesController],
    providers: [
      {
        provide: PromoCodesService,
        useValue: promoCodesService,
      },
    ],
  })
  class TestAppModule {}

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  it('POST /promo-codes normalizes payloads before reaching the service', async () => {
    const expirationDate = new Date('2099-12-31T23:59:59.000Z').toISOString();
    promoCodesService.create.mockResolvedValue({
      id: 'promo-1',
      code: 'SUMMER2026',
      discountPercentage: 10.5,
      activationLimit: 5,
      remainingActivations: 5,
      expirationDate,
    });

    const response = await request(app.getHttpServer())
      .post('/promo-codes')
      .send({
        code: '  summer2026 ',
        discountPercentage: '10.5',
        activationLimit: '5',
        expirationDate,
      })
      .expect(201)
      .expect((result) => {
        const body = result.body as SuccessResponse<{ code: string }>;
        expect(body.success).toBe(true);
        expect(body.data.code).toBe('SUMMER2026');
        expect(
          (body.data as { remainingActivations: number }).remainingActivations,
        ).toBe(5);
      });

    expect(promoCodesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 5,
        expirationDate: expect.any(Date),
      }),
    );
    expect(
      (response.body as SuccessResponse<{ code: string }>).statusCode,
    ).toBe(201);
  });

  it('GET /promo-codes transforms query params and returns the response envelope', async () => {
    promoCodesService.getAll.mockResolvedValue({
      items: [],
      meta: {
        total: 0,
        page: 3,
        limit: 2,
        totalPages: 0,
      },
    });

    await request(app.getHttpServer())
      .get('/promo-codes?page=3&limit=2')
      .expect(200)
      .expect((result) => {
        const body = result.body as SuccessResponse<{
          items: [];
          meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        }>;

        expect(body).toEqual({
          success: true,
          statusCode: 200,
          data: {
            items: [],
            meta: {
              total: 0,
              page: 3,
              limit: 2,
              totalPages: 0,
            },
          },
        });
      });

    expect(promoCodesService.getAll).toHaveBeenCalledWith(3, 2);
  });

  it('GET /promo-codes/code/:code/activations hits the dedicated route', async () => {
    promoCodesService.getActivationEmailsByCode.mockResolvedValue({
      code: 'SUMMER2026',
      emails: ['user@example.com'],
      totalActivations: 1,
    });

    await request(app.getHttpServer())
      .get('/promo-codes/code/SUMMER2026/activations')
      .expect(200)
      .expect((result) => {
        const body = result.body as SuccessResponse<{
          code: string;
          emails: string[];
          totalActivations: number;
        }>;

        expect(body.success).toBe(true);
        expect(body.data).toEqual({
          code: 'SUMMER2026',
          emails: ['user@example.com'],
          totalActivations: 1,
        });
      });

    expect(promoCodesService.getActivationEmailsByCode).toHaveBeenCalledWith(
      'SUMMER2026',
    );
  });

  it('returns the global validation error format for invalid payloads', async () => {
    await request(app.getHttpServer())
      .post('/promo-codes')
      .send({
        code: 'SUMMER2026',
        discountPercentage: 10.5,
        activationLimit: 5,
        expirationDate: '2099-12-31T23:59:59.000Z',
        unexpected: true,
      })
      .expect(400)
      .expect((result) => {
        const body = result.body as ErrorResponse;

        expect(body.success).toBe(false);
        expect(body.statusCode).toBe(400);
        expect(body.message).toBe('property unexpected should not exist');
        expect(body.path).toBe('/promo-codes');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
