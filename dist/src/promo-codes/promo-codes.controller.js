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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const promo_codes_service_1 = require("./promo-codes.service");
const create_promo_code_dto_1 = require("./dto/create-promo-code.dto");
const update_promo_code_dto_1 = require("./dto/update-promo-code.dto");
const activate_promo_code_dto_1 = require("./dto/activate-promo-code.dto");
let PromoCodesController = class PromoCodesController {
    promoCodesService;
    constructor(promoCodesService) {
        this.promoCodesService = promoCodesService;
    }
    create(createPromoCodeDto) {
        return this.promoCodesService.create(createPromoCodeDto);
    }
    getAll(page, limit, paginate) {
        const isPaginated = paginate !== 'false';
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 100;
        return this.promoCodesService.getAll(isPaginated, pageNumber, limitNumber);
    }
    findOne(id) {
        return this.promoCodesService.findOne(id);
    }
    update(id, updatePromoCodeDto) {
        return this.promoCodesService.update(id, updatePromoCodeDto);
    }
    remove(id) {
        return this.promoCodesService.remove(id);
    }
    activate(code, activatePromoCodeDto) {
        return this.promoCodesService.activatePromo(code, activatePromoCodeDto);
    }
};
exports.PromoCodesController = PromoCodesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create promo code' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promo_code_dto_1.CreatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all promo codes (supports pagination explicitly)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 100, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'paginate', required: false, type: Boolean, example: true, description: 'Set to false to completely extract all database entries' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('paginate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get promo code by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Promo code UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update promo code by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_promo_code_dto_1.UpdatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete promo code by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':code/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a promo code by providing email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activated Successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Expired or Limit Exceeded' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Already Activated by User' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, activate_promo_code_dto_1.ActivatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "activate", null);
exports.PromoCodesController = PromoCodesController = __decorate([
    (0, swagger_1.ApiTags)('promo-codes'),
    (0, common_1.Controller)('promo-codes'),
    __metadata("design:paramtypes", [promo_codes_service_1.PromoCodesService])
], PromoCodesController);
//# sourceMappingURL=promo-codes.controller.js.map