import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
    PrismaModule,
    PromoCodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
