import { Test, TestingModule } from '@nestjs/testing';
import { PokemonTypesController } from './pokemon-types.controller';
import { PokemonTypesService } from './pokemon-types.service';

describe('PokemonTypesController', () => {
  let controller: PokemonTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonTypesController],
      providers: [PokemonTypesService],
    }).compile();

    controller = module.get<PokemonTypesController>(PokemonTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
