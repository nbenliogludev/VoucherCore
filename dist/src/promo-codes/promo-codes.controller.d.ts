import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
export declare class PromoCodesController {
    private readonly promoCodesService;
    constructor(promoCodesService: PromoCodesService);
    create(createPromoCodeDto: CreatePromoCodeDto): Promise<import("./dto/promo-code-response.dto").PromoCodeResponseDto>;
    getAll(page?: string, limit?: string, paginate?: string): Promise<{
        items: import("./dto/promo-code-response.dto").PromoCodeResponseDto[];
        meta: {
            page?: number | undefined;
            limit?: number | undefined;
            totalPages?: number | undefined;
            total: number;
        };
    }>;
    findOne(id: string): Promise<import("./dto/promo-code-response.dto").PromoCodeResponseDto>;
    update(id: string, updatePromoCodeDto: UpdatePromoCodeDto): Promise<import("./dto/promo-code-response.dto").PromoCodeResponseDto>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activate(code: string, activatePromoCodeDto: ActivatePromoCodeDto): Promise<{
        message: string;
        promoCode: {
            id: any;
            code: any;
        };
    }>;
}
