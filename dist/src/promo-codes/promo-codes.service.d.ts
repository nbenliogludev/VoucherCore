import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
export declare class PromoCodesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreatePromoCodeDto): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdatePromoCodeDto): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
        activationLimit: number;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        discountPercentage: import("@prisma/client-runtime-utils").Decimal;
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
