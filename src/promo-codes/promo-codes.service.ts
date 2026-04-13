import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PromoCode } from '@prisma/client';
import { PromoCodesRepository } from './promo-codes.repository';
import { plainToInstance } from 'class-transformer';
import { PromoCodeResponseDto } from './dto/promo-code-response.dto';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: PromoCodesRepository
  ) { }

  private toResponse(promo: PromoCode): PromoCodeResponseDto {
    return plainToInstance(PromoCodeResponseDto, {
      ...promo,
      discountPercentage: promo.discountPercentage ? Number(promo.discountPercentage) : null,
    }, { excludeExtraneousValues: true });
  }

  async create(data: CreatePromoCodeDto): Promise<PromoCodeResponseDto> {
    try {
      const promo = await this.prisma.promoCode.create({ data: { ...data } });
      return this.toResponse(promo);
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Promo code '${data.code}' already exists`);
      }
      throw e;
    }
  }

  async getAll(isPaginated: boolean = true, page: number = 1, limit: number = 100) {
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

  async findOne(id: string): Promise<PromoCodeResponseDto> {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return this.toResponse(promo);
  }

  async update(id: string, data: UpdatePromoCodeDto): Promise<PromoCodeResponseDto> {
    try {
      const promo = await this.prisma.promoCode.update({ where: { id }, data });
      return this.toResponse(promo);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new NotFoundException('Promo code not found');
        if (e.code === 'P2002') throw new ConflictException('Promo code string already exists');
      }
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.promoCode.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new NotFoundException('Promo code not found');
        if (e.code === 'P2003') throw new ConflictException('Cannot delete promo code because it has existing activations');
      }
      throw e;
    }
  }

  async activatePromo(code: string, payload: ActivatePromoCodeDto) {
    const { email } = payload;

    return this.repository.executeTransaction(async (tx) => {
      const promoCode = await this.repository.findByCode(tx, code);

      if (!promoCode) {
        throw new NotFoundException('Promo code not found');
      }

      if (new Date() > new Date(promoCode.expirationDate)) {
        throw new BadRequestException('Promo code has expired');
      }

      const existing = await this.repository.findActivationByEmail(tx, promoCode.id, email);
      if (existing) {
        throw new ConflictException('You have already activated this promo code');
      }

      const isIncremented = await this.repository.incrementActivationCount(tx, promoCode.id, promoCode.activationLimit);
      if (!isIncremented) {
        throw new BadRequestException('Activation limit exceeded');
      }

      await this.repository.createActivation(tx, {
        email,
        promoCodeId: promoCode.id,
      });

      return {
        message: 'Promo code activated successfully',
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
        },
      };
    });
  }
}
