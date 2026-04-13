import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List all promo codes (supports pagination explicitly)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100, description: 'Items per page' })
  @ApiQuery({ name: 'paginate', required: false, type: Boolean, example: true, description: 'Set to false to completely extract all database entries' })
  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('paginate') paginate?: string,
  ) {
    const isPaginated = paginate !== 'false'; // Defaults to true unless explicitly disabled
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    
    return this.promoCodesService.getAll(isPaginated, pageNumber, limitNumber);
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
