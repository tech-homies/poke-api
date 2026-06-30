import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonNotFoundException } from './exceptions/pokemon-not-found.exception';

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  const mockPokemon: Pokemon = {
    pokedex_id: 25,
    generation: 1,
    category: 'Pokémon Souris',
    name: { fr: 'Pikachu', en: 'Pikachu', jp: 'ピカチュウ' },
    sprites: {
      regular: 'https://example.com/pikachu.png',
      shiny: 'https://example.com/pikachu-shiny.png',
      gmax: null,
    },
    types: [13],
    talents: [
      { name: 'Électrostatique', tc: false },
      { name: 'Paratonnerre', tc: true },
    ],
    stats: {
      hp: 35,
      atk: 55,
      def: 40,
      spe_atk: 50,
      spe_def: 50,
      vit: 90,
    },
    resistances: [
      { name: 'Normal', multiplier: 1 },
      { name: 'Électrik', multiplier: 0.5 },
      { name: 'Vol', multiplier: 0.5 },
      { name: 'Sol', multiplier: 2 },
    ],
    evolution: {
      pre: [{ pokedex_id: 172, name: 'Pichu', condition: 'Bonheur' }],
      next: [{ pokedex_id: 26, name: 'Raichu', condition: 'Pierre Foudre' }],
      mega: [],
    },
    height: '0,4 m',
    weight: '6,0 kg',
    egg_groups: ['Terrestre', 'Fée'],
    sexe: { male: 50, female: 50 },
    catch_rate: 190,
    level_100: 1000000,
    formes: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [
        {
          provide: PokemonsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: InMemoryStoreService,
          useValue: {
            exists: jest.fn(),
            set: jest.fn(),
            sMembers: jest.fn(),
            mGet: jest.fn(),
            mSet: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of pokemons', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockPokemon]);

      const result = await controller.findAll();

      expect(result).toEqual([mockPokemon]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a pokemon by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPokemon);

      const result = await controller.findOne(25);

      expect(result).toEqual(mockPokemon);
      expect(service.findOne).toHaveBeenCalledWith(25);
    });

    it('should throw PokemonNotFoundException when pokemon is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(
        PokemonNotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });
});
