"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const promo_code_response_dto_1 = require("./dto/promo-code-response.dto");
let PromoCodesService = class PromoCodesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toResponse(promo) {
        return (0, class_transformer_1.plainToInstance)(promo_code_response_dto_1.PromoCodeResponseDto, {
            ...promo,
            discountPercentage: promo.discountPercentage ? Number(promo.discountPercentage) : null,
        }, { excludeExtraneousValues: true });
    }
    async create(data) {
        try {
            const promo = await this.prisma.promoCode.create({ data: { ...data } });
            return this.toResponse(promo);
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.ConflictException(`Promo code '${data.code}' already exists`);
            }
            throw e;
        }
    }
    async getAll(isPaginated = true, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        const [promos, total] = await Promise.all([
            this.prisma.promoCode.findMany({
                ...(isPaginated ? { skip, take: limit } : {}),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.promoCode.count()
        ]);
        return {
            items: promos.map(promo => this.toResponse(promo)),
            meta: {
                total,
                ...(isPaginated && { page, limit, totalPages: Math.ceil(total / limit) })
            }
        };
    }
    async findOne(id) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promo code not found');
        return this.toResponse(promo);
    }
    async update(id, data) {
        try {
            const promo = await this.prisma.promoCode.update({ where: { id }, data });
            return this.toResponse(promo);
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2025')
                    throw new common_1.NotFoundException('Promo code not found');
                if (e.code === 'P2002')
                    throw new common_1.ConflictException('Promo code string already exists');
            }
            throw e;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.promoCode.delete({ where: { id } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2025')
                    throw new common_1.NotFoundException('Promo code not found');
                if (e.code === 'P2003')
                    throw new common_1.ConflictException('Cannot delete promo code because it has existing activations');
            }
            throw e;
        }
    }
    async activatePromo(code, payload) {
        const { email } = payload;
        return this.prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRaw `SELECT * FROM "PromoCode" WHERE "code" = ${code} FOR UPDATE`;
            const promoCode = rows[0];
            if (!promoCode) {
                throw new common_1.NotFoundException('Promo code not found');
            }
            if (new Date() > new Date(promoCode.expirationDate)) {
                throw new common_1.BadRequestException('Promo code has expired');
            }
            const currentActivations = await tx.activation.count({
                where: { promoCodeId: promoCode.id },
            });
            if (currentActivations >= promoCode.activationLimit) {
                throw new common_1.BadRequestException('Activation limit exceeded');
            }
            try {
                await tx.activation.create({
                    data: {
                        email,
                        promoCodeId: promoCode.id,
                    },
                });
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    throw new common_1.ConflictException('You have already activated this promo code');
                }
                throw e;
            }
            return {
                message: 'Promo code activated successfully',
                promoCode: {
                    id: promoCode.id,
                    code: promoCode.code,
                },
            };
        });
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromoCodesService);
//# sourceMappingURL=promo-codes.service.js.map