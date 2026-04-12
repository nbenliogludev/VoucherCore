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
exports.CreatePromoCodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePromoCodeDto {
    code;
    discountPercentage;
    activationLimit;
    expirationDate;
}
exports.CreatePromoCodeDto = CreatePromoCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUMMER2026', description: 'Unique promo code string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.5, description: 'Discount percentage value' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePromoCodeDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Maximum numeric limit for usages' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePromoCodeDto.prototype, "activationLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-31T23:59:59.000Z', description: 'ISO Expiration date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "expirationDate", void 0);
//# sourceMappingURL=create-promo-code.dto.js.map