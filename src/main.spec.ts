import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

describe('bootstrap', () => {
  const originalPort = process.env.PORT;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    if (originalPort === undefined) {
      delete process.env.PORT;
      return;
    }

    process.env.PORT = originalPort;
  });

  async function loadMainModule(port?: string) {
    if (port === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = port;
    }

    const app = {
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    const createMock = jest.fn().mockResolvedValue(app);
    const createDocumentMock = jest.fn().mockReturnValue({ openapi: '3.0.0' });
    const setupMock = jest.fn(
      (_path: string, _app: unknown, documentFactory: () => unknown) =>
        documentFactory(),
    );
    const builderInstances: Array<{
      setTitle: jest.Mock;
      setDescription: jest.Mock;
      setVersion: jest.Mock;
      build: jest.Mock;
    }> = [];

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }));

    jest.doMock('./app.module', () => ({
      AppModule: class AppModule {},
    }));

    jest.doMock('@nestjs/swagger', () => ({
      SwaggerModule: {
        createDocument: createDocumentMock,
        setup: setupMock,
      },
      DocumentBuilder: class DocumentBuilder {
        setTitle = jest.fn().mockReturnThis();
        setDescription = jest.fn().mockReturnThis();
        setVersion = jest.fn().mockReturnThis();
        build = jest.fn().mockReturnValue({ title: 'Voucher Core API' });

        constructor() {
          builderInstances.push(this);
        }
      },
    }));

    jest.isolateModules(() => {
      require('./main');
    });

    await new Promise((resolve) => setImmediate(resolve));

    return {
      app,
      createMock,
      createDocumentMock,
      setupMock,
      builder: builderInstances[0],
    };
  }

  it('configures the application and listens on the explicit PORT value', async () => {
    const { app, createMock, createDocumentMock, setupMock, builder } =
      await loadMainModule('4321');
    const [validationPipe] = app.useGlobalPipes.mock.calls[0] as [
      { constructor: { name: string } },
    ];
    const [interceptor] = app.useGlobalInterceptors.mock.calls[0] as [
      { constructor: { name: string } },
    ];
    const [filter] = app.useGlobalFilters.mock.calls[0] as [
      { constructor: { name: string } },
    ];

    expect(createMock).toHaveBeenCalledWith(expect.any(Function));
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(validationPipe.constructor.name).toBe('ValidationPipe');
    expect(interceptor.constructor.name).toBe(TransformInterceptor.name);
    expect(filter.constructor.name).toBe(AllExceptionsFilter.name);
    expect(builder.setTitle).toHaveBeenCalledWith('Voucher Core API');
    expect(builder.setDescription).toHaveBeenCalledWith(
      'API for managing promo codes and activations',
    );
    expect(builder.setVersion).toHaveBeenCalledWith('1.0');
    expect(builder.build).toHaveBeenCalledTimes(1);
    expect(setupMock).toHaveBeenCalledWith(
      'api/docs',
      app,
      expect.any(Function),
    );
    expect(createDocumentMock).toHaveBeenCalledWith(app, {
      title: 'Voucher Core API',
    });
    expect(app.listen).toHaveBeenCalledWith('4321');
  });

  it('falls back to port 3000 when PORT is not defined', async () => {
    const { app } = await loadMainModule();

    expect(app.listen).toHaveBeenCalledWith(3000);
  });
});
