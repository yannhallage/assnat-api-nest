import { Test, TestingModule } from '@nestjs/testing';
import { ChefdeserviceService } from './chefdeservice.service';

describe('ChefdeserviceService', () => {
  let service: ChefdeserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChefdeserviceService],
    }).compile();

    service = module.get<ChefdeserviceService>(ChefdeserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
