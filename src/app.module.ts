import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';

@Module({
  imports: [PrismaModule, PromoCodesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
