import { Test, TestingModule } from '@nestjs/testing';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { TrainersService } from '../trainers/trainers.service';
import { TeamsService } from '../teams/teams.service';
import { PokemonsService } from '../pokemons/pokemons.service';
import { PokemonTypesService } from '../pokemon-types/pokemon-types.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { Battle } from './entities/battle.entity';

describe('BattlesController', () => {
  let controller: BattlesController;
  let service: BattlesService;

  const mockBattle: Battle = {
    trainer1Id: 1,
    trainer2Id: 2,
    winnerId: 1,
    duels: [
      {
        winnerId: 1,
        loserId: 4,
        winnerScore: 150,
        loserScore: 120,
      },
    ],
    datetime: new Date('2025-12-07T10:30:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        {
          provide: BattlesService,
          useValue: {
            findAll: jest.fn(),
            findByTrainerId: jest.fn(),
            fight: jest.fn(),
          },
        },
        {
          provide: TrainersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TeamsService,
          useValue: {
            getTeamByTrainerId: jest.fn(),
          },
        },
        {
          provide: PokemonsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PokemonTypesService,
          useValue: {
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
          },
        },
      ],
    }).compile();

    controller = module.get<BattlesController>(BattlesController);
    service = module.get<BattlesService>(BattlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of battles with datetime', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockBattle]);

      const result = await controller.findAll();

      expect(result).toEqual([mockBattle]);
      expect(result[0]).toHaveProperty('datetime');
      expect(result[0].datetime).toBeInstanceOf(Date);
    });

    it('should return battles for a specific trainer when trainerId is provided', async () => {
      jest.spyOn(service, 'findByTrainerId').mockResolvedValue([mockBattle]);

      const result = await controller.findAll(1);

      expect(result).toEqual([mockBattle]);
      expect(result[0]).toHaveProperty('datetime');
      expect(result[0].datetime).toBeInstanceOf(Date);
    });
  });

  describe('fight', () => {
    it('should create a battle with datetime', async () => {
      jest.spyOn(service, 'fight').mockResolvedValue(mockBattle);

      const result = await controller.fight({ trainer1Id: 1, trainer2Id: 2 });

      expect(result).toEqual(mockBattle);
      expect(result).toHaveProperty('datetime');
      expect(result.datetime).toBeInstanceOf(Date);
    });
  });
});
