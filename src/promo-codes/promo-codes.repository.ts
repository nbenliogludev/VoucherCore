import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PromoCode, Activation } from '@prisma/client';

@Injectable()
export class PromoCodesRepository {
  constructor(private readonly prisma: PrismaService) { }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async findByCodeWithLock(tx: Prisma.TransactionClient, code: string): Promise<PromoCode | null> {
    const rows = await tx.$queryRaw<PromoCode[]>`SELECT * FROM "PromoCode" WHERE "code" = ${code} FOR UPDATE`;
    return rows[0] || null;
  }

  async countActivations(tx: Prisma.TransactionClient, promoCodeId: string): Promise<number> {
    return tx.activation.count({
      where: { promoCodeId },
    });
  }

  async createActivation(tx: Prisma.TransactionClient, data: Prisma.ActivationUncheckedCreateInput): Promise<Activation> {
    return tx.activation.create({ data });
  }
}
