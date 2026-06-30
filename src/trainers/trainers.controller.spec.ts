import { Test, TestingModule } from '@nestjs/testing';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { Trainer } from './entities/trainer.entity';
import { TrainerNotFoundException } from './exceptions/trainer-not-found.exception';

describe('TrainersController', () => {
  let controller: TrainersController;
  let service: TrainersService;

  const mockTrainer: Trainer = {
    id: 1,
    name: 'Sacha',
    avatarUrl: 'https://example.com/avatar1.jpg',
    description:
      'Un dresseur de Pokémon déterminé originaire de Bourg Palette.',
    age: 10,
    hometown: 'Bourg Palette',
    level: 'beginner',
    favoritePokemon: 25,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainersController],
      providers: [
        {
          provide: TrainersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
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
            sAdd: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TrainersController>(TrainersController);
    service = module.get<TrainersService>(TrainersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of trainers', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockTrainer]);

      const result = await controller.findAll();

      expect(result).toEqual([mockTrainer]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a trainer by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTrainer);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockTrainer);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw TrainerNotFoundException when trainer is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(
        TrainerNotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create and return a new trainer', async () => {
      const createTrainerDto = {
        name: 'Ondine',
        avatarUrl: 'https://example.com/avatar2.jpg',
        description: "Championne d'arène spécialisée dans les Pokémon Eau.",
        age: 12,
        hometown: 'Azuria',
        level: 'intermediate' as const,
      };
      const newTrainer = { ...createTrainerDto, id: 2 };

      jest.spyOn(service, 'create').mockResolvedValue(newTrainer);

      const result = await controller.create(createTrainerDto);

      expect(result).toEqual(newTrainer);
      expect(service.create).toHaveBeenCalledWith(createTrainerDto);
    });
  });
});
