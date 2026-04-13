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
exports.PromoCodeResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class PromoCodeResponseDto {
    id;
    code;
    discountPercentage;
    activationLimit;
    expirationDate;
}
exports.PromoCodeResponseDto = PromoCodeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The unique UUID of the promo code' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PromoCodeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The unique string value input by the user' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PromoCodeResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The discount percentage this code provides' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined && value !== null ? Number(value) : value),
    __metadata("design:type", Number)
], PromoCodeResponseDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'How many times this code can be activated' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], PromoCodeResponseDto.prototype, "activationLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The date and time this code naturally expires' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], PromoCodeResponseDto.prototype, "expirationDate", void 0);
//# sourceMappingURL=promo-code-response.dto.js.map