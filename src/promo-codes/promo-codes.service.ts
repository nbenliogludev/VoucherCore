import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePromoCodeDto) {
    try {
      return await this.prisma.promoCode.create({ data });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Promo code string already exists');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.promoCode.findMany();
  }

  async findOne(id: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  async update(id: string, data: UpdatePromoCodeDto) {
    try {
      return await this.prisma.promoCode.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Promo code not found');
      if (e.code === 'P2002') throw new ConflictException('Promo code string already exists');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.promoCode.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Promo code not found');
      if (e.code === 'P2003') throw new ConflictException('Cannot delete promo code because it has existing activations');
      throw e;
    }
  }

  async activatePromo(code: string, payload: ActivatePromoCodeDto) {
    const { email } = payload;
    
    // Using interactive transactions to achieve row-level locking
    return this.prisma.$transaction(async (tx) => {
      // 1. SELECT FOR UPDATE locks the row exclusively until tx ends
      const rows = await tx.$queryRaw<any[]>`SELECT * FROM "PromoCode" WHERE "code" = ${code} FOR UPDATE`;
      const promoCode = rows[0];

      if (!promoCode) {
        throw new NotFoundException('Promo code not found');
      }

      // 2. Validate expiration date
      if (new Date() > new Date(promoCode.expirationDate)) {
        throw new BadRequestException('Promo code has expired');
      }

      // 3. Check activation limit
      const currentActivations = await tx.activation.count({
        where: { promoCodeId: promoCode.id },
      });

      if (currentActivations >= promoCode.activationLimit) {
        throw new BadRequestException('Activation limit exceeded');
      }

      // 4. Try creation
      try {
        await tx.activation.create({
          data: {
            email,
            promoCodeId: promoCode.id,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new ConflictException('You have already activated this promo code');
        }
        throw err;
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
}
