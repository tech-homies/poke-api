import { TrainersService } from './trainers.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';

function makeCreateTrainerDto(
  overrides: Partial<CreateTrainerDto> = {},
): CreateTrainerDto {
  return {
    name: 'Ondine',
    avatarUrl: 'https://example.com/avatar.png',
    description: "Championne d'arène spécialisée dans les Pokémon Eau.",
    age: 12,
    hometown: 'Azuria',
    level: 'intermediate',
    ...overrides,
  };
}

describe('TrainersService', () => {
  let service: TrainersService;

  beforeEach(() => {
    service = new TrainersService(new InMemoryStoreService());
  });

  describe('findAll / findOne (before seeding)', () => {
    it('returns an empty list when no trainer has been created yet', async () => {
      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('returns undefined for an unknown id', async () => {
      await expect(service.findOne(999)).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('generates sequential ids starting at 1', async () => {
      const first = await service.create(makeCreateTrainerDto());
      const second = await service.create(makeCreateTrainerDto());

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
    });

    it('persists the created trainer so it can be found again', async () => {
      const created = await service.create(
        makeCreateTrainerDto({ name: 'Pierre' }),
      );

      await expect(service.findOne(created.id)).resolves.toEqual(created);
      await expect(service.findAll()).resolves.toEqual([created]);
    });
  });

  describe('onModuleInit', () => {
    it('loads the static trainers dataset', async () => {
      await service.onModuleInit();

      await expect(service.findAll()).resolves.toHaveLength(trainers.length);
    });

    it('is idempotent (does not duplicate data when called twice)', async () => {
      await service.onModuleInit();
      await service.onModuleInit();

      await expect(service.findAll()).resolves.toHaveLength(trainers.length);
    });

    it('continues the id sequence after the seeded dataset', async () => {
      await service.onModuleInit();
      const maxSeededId = Math.max(...trainers.map((t) => t.id));

      const created = await service.create(makeCreateTrainerDto());

      expect(created.id).toBe(maxSeededId + 1);
    });
  });
});
