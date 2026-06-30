import { BattlesService } from './battles.service';
import { TrainersService } from '../trainers/trainers.service';
import { TeamsService } from '../teams/teams.service';
import { PokemonsService } from '../pokemons/pokemons.service';
import { PokemonTypesService } from '../pokemon-types/pokemon-types.service';
import { InMemoryStoreService } from '../store/in-memory-store.service';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { PokemonType } from '../pokemon-types/entities/pokemon-type.entity';
import { TeamDto } from '../teams/dto/team.dto';
import { TrainerNotFoundException } from '../trainers/exceptions/trainer-not-found.exception';
import { SameTrainerException } from './exceptions/same-trainer.exception';
import { TrainerNoTeamException } from './exceptions/trainer-no-team.exception';

const FIRE_TYPE_ID = 1;
const GRASS_TYPE_ID = 2;

function makePokemon(
  overrides: Partial<Pokemon> & Pick<Pokemon, 'pokedex_id' | 'types'>,
): Pokemon {
  return {
    generation: 1,
    category: 'Test',
    name: { fr: 'Test', en: 'Test', jp: 'Test' },
    sprites: {
      regular: 'https://example.com/regular.png',
      shiny: null,
      gmax: null,
    },
    talents: [],
    stats: { hp: 50, atk: 50, def: 50, spe_atk: 50, spe_def: 50, vit: 50 },
    resistances: [],
    evolution: { pre: [], next: [], mega: [] },
    height: '1 m',
    weight: '10 kg',
    egg_groups: [],
    sexe: null,
    catch_rate: 100,
    level_100: 100,
    formes: [],
    ...overrides,
  };
}

function makeTrainer(
  overrides: Partial<Trainer> & Pick<Trainer, 'id' | 'name'>,
): Trainer {
  return {
    avatarUrl: 'https://example.com/avatar.png',
    description: 'Test trainer',
    age: 10,
    hometown: 'Test Town',
    level: 'beginner',
    ...overrides,
  };
}

describe('BattlesService', () => {
  const fireType: PokemonType = {
    id: FIRE_TYPE_ID,
    name: { fr: 'Feu', en: 'Fire', jp: 'Fire' },
    sprites: 'https://example.com/feu.png',
    resistances: [],
  };
  const grassType: PokemonType = {
    id: GRASS_TYPE_ID,
    name: { fr: 'Plante', en: 'Grass', jp: 'Grass' },
    sprites: 'https://example.com/plante.png',
    // La Plante est faible face au Feu : l'attaquant Feu obtient un bonus.
    resistances: [{ name: 'Feu', multiplier: 2 }],
  };
  const pokemonTypesById = new Map([
    [FIRE_TYPE_ID, fireType],
    [GRASS_TYPE_ID, grassType],
  ]);

  // 3 Pokémon Feu (toujours vainqueurs face à un Pokémon Plante, voir
  // calculateScore : score Feu >= 130, score Plante < 130, déterministe
  // malgré la part d'aléatoire de duel()).
  const firePokemons = [101, 102, 103].map((id) =>
    makePokemon({ pokedex_id: id, types: [FIRE_TYPE_ID] }),
  );
  const grassPokemons = [201, 202, 203].map((id) =>
    makePokemon({ pokedex_id: id, types: [GRASS_TYPE_ID] }),
  );
  const pokemonsById = new Map(
    [...firePokemons, ...grassPokemons].map((p) => [p.pokedex_id, p]),
  );

  const trainer1 = makeTrainer({ id: 1, name: 'Trainer Fire' });
  const trainer2 = makeTrainer({ id: 2, name: 'Trainer Grass' });
  const trainersById = new Map([
    [trainer1.id, trainer1],
    [trainer2.id, trainer2],
  ]);

  let teamsByTrainerId: Map<number, number[]>;
  let service: BattlesService;

  beforeEach(() => {
    // Recréé à chaque test pour éviter qu'un test qui mute les équipes
    // (cf. "team is incomplete") ne pollue les tests suivants.
    teamsByTrainerId = new Map<number, number[]>([
      [trainer1.id, firePokemons.map((p) => p.pokedex_id)],
      [trainer2.id, grassPokemons.map((p) => p.pokedex_id)],
    ]);

    const trainersService = {
      findOne: jest.fn((id: number) => Promise.resolve(trainersById.get(id))),
    } as unknown as TrainersService;

    const teamsService = {
      getTeamByTrainerId: jest.fn((trainerId: number): Promise<TeamDto> =>
        Promise.resolve({
          trainerId,
          pokemons: teamsByTrainerId.get(trainerId) ?? [],
        }),
      ),
    } as unknown as TeamsService;

    const pokemonsService = {
      findOne: jest.fn((id: number) => Promise.resolve(pokemonsById.get(id))),
    } as unknown as PokemonsService;

    const pokemonTypesService = {
      findOne: jest.fn((id: number) => pokemonTypesById.get(id)),
    } as unknown as PokemonTypesService;

    service = new BattlesService(
      trainersService,
      teamsService,
      pokemonsService,
      pokemonTypesService,
      new InMemoryStoreService(),
    );
  });

  describe('fight', () => {
    it('throws TrainerNotFoundException when a trainer does not exist', async () => {
      await expect(service.fight(trainer1.id, 999)).rejects.toThrow(
        TrainerNotFoundException,
      );
    });

    it('throws SameTrainerException when both trainers are identical', async () => {
      await expect(service.fight(trainer1.id, trainer1.id)).rejects.toThrow(
        SameTrainerException,
      );
    });

    it('throws TrainerNoTeamException when a team is incomplete', async () => {
      teamsByTrainerId.set(trainer2.id, [grassPokemons[0].pokedex_id]);

      await expect(service.fight(trainer1.id, trainer2.id)).rejects.toThrow(
        TrainerNoTeamException,
      );
    });

    it('lets the trainer with the type advantage win every duel', async () => {
      const battle = await service.fight(trainer1.id, trainer2.id);

      expect(battle.winnerId).toBe(trainer1.id);
      expect(battle.duels).toHaveLength(3);
      for (const duel of battle.duels) {
        expect(firePokemons.map((p) => p.pokedex_id)).toContain(duel.winnerId);
        expect(duel.winnerScore).toBeGreaterThan(duel.loserScore);
      }
    });

    it('persists the battle with a usable Date (not a plain string)', async () => {
      const battle = await service.fight(trainer1.id, trainer2.id);

      expect(battle.datetime).toBeInstanceOf(Date);

      // On vérifie ici que la date relue depuis le store expose bien une API
      // Date fonctionnelle (et pas une string JSON) plutôt que `toBeInstanceOf`,
      // car structuredClone() produit, sous Jest, une instance Date d'un
      // "realm" différent de celle du test (faux négatif connu de Jest, sans
      // rapport avec un bug applicatif réel).
      const [persisted] = await service.findByTrainerId(trainer1.id);
      expect(typeof persisted.datetime.getTime).toBe('function');
      expect(persisted.datetime.getTime()).toBe(battle.datetime.getTime());
    });
  });

  describe('findAll / findByTrainerId', () => {
    it('returns an empty list when no battle has been fought', async () => {
      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('sorts battles by datetime descending', async () => {
      await service.fight(trainer1.id, trainer2.id);
      await service.fight(trainer1.id, trainer2.id);

      const battles = await service.findAll();
      expect(battles).toHaveLength(2);
      expect(battles[0].datetime.getTime()).toBeGreaterThanOrEqual(
        battles[1].datetime.getTime(),
      );
    });

    it('throws TrainerNotFoundException for an unknown trainer', async () => {
      await expect(service.findByTrainerId(999)).rejects.toThrow(
        TrainerNotFoundException,
      );
    });

    it('only returns battles involving the requested trainer', async () => {
      await service.fight(trainer1.id, trainer2.id);

      const battles = await service.findByTrainerId(trainer1.id);
      expect(battles).toHaveLength(1);
      expect(
        battles.every(
          (b) => b.trainer1Id === trainer1.id || b.trainer2Id === trainer1.id,
        ),
      ).toBe(true);
    });
  });
});
