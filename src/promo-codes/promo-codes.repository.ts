import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PromoCode, Activation } from '@prisma/client';

@Injectable()
export class PromoCodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async findByCode(
    tx: Prisma.TransactionClient,
    code: string,
  ): Promise<PromoCode | null> {
    return tx.promoCode.findUnique({ where: { code } });
  }

  async findById(id: string): Promise<PromoCode | null> {
    return this.prisma.promoCode.findUnique({ where: { id } });
  }

  async hasActivations(promoCodeId: string): Promise<boolean> {
    const activationCount = await this.prisma.activation.count({
      where: { promoCodeId },
    });

    return activationCount > 0;
  }

  async incrementActivationCount(
    tx: Prisma.TransactionClient,
    id: string,
    limit: number,
  ): Promise<boolean> {
    const result = await tx.promoCode.updateMany({
      where: {
        id,
        currentActivations: { lt: limit },
      },
      data: {
        currentActivations: { increment: 1 },
      },
    });
    return result.count > 0;
  }

  async findActivationByEmail(
    tx: Prisma.TransactionClient,
    promoCodeId: string,
    email: string,
  ): Promise<Activation | null> {
    return tx.activation.findUnique({
      where: {
        email_promoCodeId: {
          email,
          promoCodeId,
        },
      },
    });
  }

  async createActivation(
    tx: Prisma.TransactionClient,
    data: Prisma.ActivationUncheckedCreateInput,
  ): Promise<Activation> {
    return tx.activation.create({ data });
  }
}
