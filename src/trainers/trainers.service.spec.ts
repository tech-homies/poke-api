import { TrainersService } from './trainers.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { TrainerNotFoundException } from './exceptions/trainer-not-found.exception';

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

  describe('update', () => {
    it('updates and persists an existing trainer', async () => {
      const created = await service.create(makeCreateTrainerDto());

      const updateTrainerDto: UpdateTrainerDto = makeCreateTrainerDto({
        name: 'Ondine (mise à jour)',
      });
      const updated = await service.update(created.id, updateTrainerDto);

      expect(updated).toEqual({ id: created.id, ...updateTrainerDto });
      await expect(service.findOne(created.id)).resolves.toEqual(updated);
    });

    it('throws TrainerNotFoundException for an unknown id', async () => {
      await expect(service.update(999, makeCreateTrainerDto())).rejects.toThrow(
        TrainerNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing trainer', async () => {
      const created = await service.create(makeCreateTrainerDto());

      await service.remove(created.id);

      await expect(service.findOne(created.id)).resolves.toBeUndefined();
      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('throws TrainerNotFoundException for an unknown id', async () => {
      await expect(service.remove(999)).rejects.toThrow(
        TrainerNotFoundException,
      );
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
