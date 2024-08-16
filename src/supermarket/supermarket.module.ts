import { Module } from '@nestjs/common';
import { SupermarketController } from './supermarket.controller';
import { SupermarketService } from './supermarket.service';

@Module({
  controllers: [SupermarketController],
  providers: [SupermarketService]
})
export class SupermarketModule {}
