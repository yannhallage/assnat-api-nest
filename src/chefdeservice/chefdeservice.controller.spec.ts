import { Test, TestingModule } from '@nestjs/testing';
import { ChefdeserviceController } from './chefdeservice.controller';
import { ChefdeserviceService } from './chefdeservice.service';

describe('ChefdeserviceController', () => {
  let controller: ChefdeserviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefdeserviceController],
      providers: [ChefdeserviceService],
    }).compile();

    controller = module.get<ChefdeserviceController>(ChefdeserviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
