// src/sales/sales.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(
    @Body('userId') userId: number,
    @Body('supermarketId') supermarketId: number,
    @Body('productQuantities')
    productQuantities: { productId: number; quantity: number }[],
    @Body('totalPrice') totalPrice: number,
  ) {
    return this.salesService.createSale(
      userId,
      supermarketId,
      productQuantities,
      totalPrice,
    );
  }
}
