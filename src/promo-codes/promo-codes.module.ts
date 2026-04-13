import { Module } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';

import { PromoCodesRepository } from './promo-codes.repository';

@Module({
  controllers: [PromoCodesController],
  providers: [PromoCodesService, PromoCodesRepository],
})
export class PromoCodesModule {}
