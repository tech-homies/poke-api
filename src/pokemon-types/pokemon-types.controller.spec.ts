import { Test, TestingModule } from '@nestjs/testing';
import { PokemonTypesController } from './pokemon-types.controller';
import { PokemonTypesService } from './pokemon-types.service';
import { pokemonTypes } from './pokemon-types.data';
import { PokemonTypeNotFoundException } from './exceptions/pokemon-type-not-found.exception';

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

  describe('findAll', () => {
    it('returns every pokemon type from the dataset', () => {
      const result = controller.findAll();

      expect(result).toEqual(pokemonTypes);
    });
  });

  describe('findOne', () => {
    it('returns a pokemon type by id', () => {
      const [expected] = pokemonTypes;

      expect(controller.findOne(expected.id)).toEqual(expected);
    });

    it('throws PokemonTypeNotFoundException when the type is not found', () => {
      expect(() => controller.findOne(999_999)).toThrow(
        PokemonTypeNotFoundException,
      );
    });
  });
});
