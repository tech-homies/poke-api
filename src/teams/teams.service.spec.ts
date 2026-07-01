import { TeamsService } from './teams.service';
import { TrainersService } from '../trainers/trainers.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { Trainer } from '../trainers/entities/trainer.entity';
import { TrainerNotFoundException } from '../trainers/exceptions/trainer-not-found.exception';
import { TeamSizeExceededException } from './exceptions/team-size-exceeded.exception';
import { DuplicatePokemonException } from './exceptions/duplicate-pokemon.exception';

describe('TeamsService', () => {
  const trainer: Trainer = {
    id: 1,
    name: 'Sacha',
    avatarUrl: 'https://example.com/avatar.png',
    description: 'Test trainer',
    age: 10,
    hometown: 'Bourg Palette',
    level: 'beginner',
  };

  let service: TeamsService;
  let trainersService: TrainersService;

  beforeEach(() => {
    trainersService = {
      findOne: jest.fn((id: number) =>
        Promise.resolve(id === trainer.id ? trainer : undefined),
      ),
    } as unknown as TrainersService;

    service = new TeamsService(trainersService, new InMemoryStoreService());
  });

  describe('getTeamByTrainerId', () => {
    it('throws TrainerNotFoundException for an unknown trainer', async () => {
      await expect(service.getTeamByTrainerId(999)).rejects.toThrow(
        TrainerNotFoundException,
      );
    });

    it('returns an empty team for a trainer who never set one up', async () => {
      await expect(service.getTeamByTrainerId(trainer.id)).resolves.toEqual({
        trainerId: trainer.id,
        pokemons: [],
      });
    });
  });

  describe('updateTeamByTrainerId', () => {
    it('throws TrainerNotFoundException for an unknown trainer', async () => {
      await expect(
        service.updateTeamByTrainerId(999, { pokemons: [1] }),
      ).rejects.toThrow(TrainerNotFoundException);
    });

    it('throws TeamSizeExceededException when the team exceeds TEAM_SIZE', async () => {
      await expect(
        service.updateTeamByTrainerId(trainer.id, {
          pokemons: [1, 2, 3, 4],
        }),
      ).rejects.toThrow(TeamSizeExceededException);
    });

    it('throws DuplicatePokemonException when a pokemon is repeated', async () => {
      await expect(
        service.updateTeamByTrainerId(trainer.id, {
          pokemons: [1, 1, 2],
        }),
      ).rejects.toThrow(DuplicatePokemonException);
    });

    it('accepts a partial team (fewer than TEAM_SIZE pokemons)', async () => {
      await service.updateTeamByTrainerId(trainer.id, {
        pokemons: [1],
      });

      await expect(service.getTeamByTrainerId(trainer.id)).resolves.toEqual({
        trainerId: trainer.id,
        pokemons: [1],
      });
    });

    it('persists a full, valid team', async () => {
      await service.updateTeamByTrainerId(trainer.id, {
        pokemons: [1, 2, 3],
      });

      await expect(service.getTeamByTrainerId(trainer.id)).resolves.toEqual({
        trainerId: trainer.id,
        pokemons: [1, 2, 3],
      });
    });
  });

  describe('deleteTeamByTrainerId', () => {
    it('throws TrainerNotFoundException for an unknown trainer', async () => {
      await expect(service.deleteTeamByTrainerId(999)).rejects.toThrow(
        TrainerNotFoundException,
      );
    });

    it('removes a previously saved team', async () => {
      await service.updateTeamByTrainerId(trainer.id, {
        pokemons: [1, 2, 3],
      });

      await service.deleteTeamByTrainerId(trainer.id);

      await expect(service.getTeamByTrainerId(trainer.id)).resolves.toEqual({
        trainerId: trainer.id,
        pokemons: [],
      });
    });
  });
});
