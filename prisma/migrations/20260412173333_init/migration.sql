CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercentage" DECIMAL(65,30) NOT NULL,
    "activationLimit" INTEGER NOT NULL,
    "currentActivations" INTEGER NOT NULL DEFAULT 0,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX "PromoCode_createdAt_idx" ON "PromoCode"("createdAt");
CREATE UNIQUE INDEX "Activation_email_promoCodeId_key" ON "Activation"("email", "promoCodeId");
CREATE INDEX "Activation_promoCodeId_idx" ON "Activation"("promoCodeId");

ALTER TABLE "Activation" ADD CONSTRAINT "Activation_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;