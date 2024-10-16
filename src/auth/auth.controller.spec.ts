import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('Controlador de autenticación', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('se debe definir', () => {
    expect(controller).toBeDefined();
  });
});
