import { Test, TestingModule } from '@nestjs/testing';
import { SupermarketController } from './supermarket.controller';

describe('SupermarketController', () => {
  let controller: SupermarketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupermarketController],
    }).compile();

    controller = module.get<SupermarketController>(SupermarketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
