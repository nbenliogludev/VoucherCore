import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) { }

  @Post()
  @ApiOperation({ summary: 'Create promo code' })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all promo codes' })
  findAll() {
    return this.promoCodesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promo code by ID' })
  @ApiParam({ name: 'id', description: 'Promo code UUID' })
  findOne(@Param('id') id: string) {
    return this.promoCodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promo code by ID' })
  update(@Param('id') id: string, @Body() updatePromoCodeDto: UpdatePromoCodeDto) {
    return this.promoCodesService.update(id, updatePromoCodeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete promo code by ID' })
  remove(@Param('id') id: string) {
    return this.promoCodesService.remove(id);
  }

  @Post(':code/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a promo code by providing email' })
  @ApiResponse({ status: 200, description: 'Activated Successfully' })
  @ApiResponse({ status: 400, description: 'Expired or Limit Exceeded' })
  @ApiResponse({ status: 409, description: 'Already Activated by User' })
  activate(@Param('code') code: string, @Body() activatePromoCodeDto: ActivatePromoCodeDto) {
    return this.promoCodesService.activatePromo(code, activatePromoCodeDto);
  }
}
