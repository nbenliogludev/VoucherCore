import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PromoCodeResponseDto } from './dto/promo-code-response.dto';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
export declare class PromoCodesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toResponse;
    create(data: CreatePromoCodeDto): Promise<PromoCodeResponseDto>;
    getAll(isPaginated?: boolean, page?: number, limit?: number): Promise<{
        items: PromoCodeResponseDto[];
        meta: {
            page?: number | undefined;
            limit?: number | undefined;
            totalPages?: number | undefined;
            total: number;
        };
    }>;
    findOne(id: string): Promise<PromoCodeResponseDto>;
    update(id: string, data: UpdatePromoCodeDto): Promise<PromoCodeResponseDto>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        discountPercentage: Prisma.Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activatePromo(code: string, payload: ActivatePromoCodeDto): Promise<{
        message: string;
        promoCode: {
            id: any;
            code: any;
        };
    }>;
}
