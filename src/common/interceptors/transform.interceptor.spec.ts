import { ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  it('wraps the handler response into the standard API envelope', async () => {
    const interceptor = new TransformInterceptor<{ ok: boolean }>();
    const response = { statusCode: 201 };
    const context = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as ExecutionContext;

    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ ok: true }),
      }),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 201,
      data: { ok: true },
    });
  });
});
