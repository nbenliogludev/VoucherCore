import { MODULE_METADATA } from '@nestjs/common/constants';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesModule } from './promo-codes.module';
import { PromoCodesRepository } from './promo-codes.repository';
import { PromoCodesService } from './promo-codes.service';

describe('PromoCodesModule', () => {
  it('registers the controller and providers', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, PromoCodesModule),
    ).toEqual([PromoCodesController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, PromoCodesModule),
    ).toEqual([PromoCodesService, PromoCodesRepository]);
  });
});
