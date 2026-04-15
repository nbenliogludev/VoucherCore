import { MODULE_METADATA } from '@nestjs/common/constants';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppModule } from './app.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';

describe('AppModule', () => {
  it('imports the throttler, Prisma, and promo codes modules', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: ThrottlerModule }),
        PrismaModule,
        PromoCodesModule,
      ]),
    );
  });
});
