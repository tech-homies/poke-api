import { Test, TestingModule } from '@nestjs/testing';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { TrainersService } from '../trainers/trainers.service';
import { TeamsService } from '../teams/teams.service';
import { PokemonsService } from '../pokemons/pokemons.service';
import { PokemonTypesService } from '../pokemon-types/pokemon-types.service';

describe('BattlesController', () => {
  let controller: BattlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        BattlesService,
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
      ],
    }).compile();

    controller = module.get<BattlesController>(BattlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
