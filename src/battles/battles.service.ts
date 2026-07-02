import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { TrainersService } from '../trainers/trainers.service';
import { TeamsService } from '../teams/teams.service';
import { PokemonsService } from '../pokemons/pokemons.service';
import { PokemonTypesService } from '../pokemon-types/pokemon-types.service';
import { TrainerNotFoundException } from '../trainers/exceptions/trainer-not-found.exception';
import { SameTrainerException } from './exceptions/same-trainer.exception';
import { TrainerNoTeamException } from './exceptions/trainer-no-team.exception';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { Battle, DuelResult } from './entities/battle.entity';
import { TEAM_SIZE } from '../common/constants/team.constants';
import { Store } from '../store/store';
import { battles } from './battles.data';

const BATTLES_INDEX_KEY = 'index:battles';
const BATTLE_KEY_PREFIX = 'battle:';
const BATTLE_COUNTER_KEY = 'counter:battle_id';

@Injectable()
export class BattlesService implements OnModuleInit {
  private readonly logger = new Logger(BattlesService.name);

  constructor(
    @Inject(forwardRef(() => TrainersService))
    private readonly trainersService: TrainersService,
    private readonly teamsService: TeamsService,
    private readonly pokemonsService: PokemonsService,
    private readonly pokemonTypesService: PokemonTypesService,
    private readonly store: Store,
  ) {}

  async onModuleInit() {
    // Charger les données initiales en mémoire au démarrage
    const exists = await this.store.exists(BATTLES_INDEX_KEY);
    if (!exists) {
      if (battles.length > 0) {
        // Stocker chaque Battle individuellement, identifié par un ID
        // séquentiel (1..N)
        const keyValuePairs = battles.map((battle, index) => ({
          key: `${BATTLE_KEY_PREFIX}${index + 1}`,
          value: battle,
        }));

        await this.store.mSet(keyValuePairs);

        // Maintenir un index des IDs de combats existants
        for (let id = 1; id <= battles.length; id++) {
          await this.store.sAdd(BATTLES_INDEX_KEY, id.toString());
        }

        // Initialiser le compteur pour les nouveaux combats
        await this.store.set(BATTLE_COUNTER_KEY, battles.length);
      }

      this.logger.log('✅ Données des combats chargées en mémoire');
    }
  }

  /**
   * Récupère la liste de tous les combats
   */
  async findAll(): Promise<Battle[]> {
    const battleKeys = await this.store.sMembers(BATTLES_INDEX_KEY);
    if (battleKeys.length === 0) return [];

    const keys = battleKeys.map((key) => `${BATTLE_KEY_PREFIX}${key}`);
    const battles = await this.store.mGet<Battle>(keys);

    return battles
      .filter((battle): battle is Battle => battle !== null)
      .sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
      ); // Tri par date décroissante
  }

  /**
   * Récupère les combats d'un dresseur donné
   */
  async findByTrainerId(trainerId: number): Promise<Battle[]> {
    // Vérifier que le dresseur existe
    const trainer = await this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    // Retourner tous les combats où le dresseur a participé
    const battles = await this.findAll();
    return battles.filter(
      (battle) =>
        battle.trainer1Id === trainerId || battle.trainer2Id === trainerId,
    );
  }

  /**
   * Supprime tous les combats auxquels un dresseur a participé (utilisée en
   * interne lors de la suppression en cascade d'un dresseur, voir
   * TrainersService.remove). Contrairement à findByTrainerId, ne vérifie pas
   * l'existence du dresseur : la suppression reste silencieuse si celui-ci
   * n'a jamais eu de combat.
   */
  async deleteByTrainerId(trainerId: number): Promise<void> {
    const battleIds = await this.store.sMembers(BATTLES_INDEX_KEY);
    if (battleIds.length === 0) return;

    const keys = battleIds.map((id) => `${BATTLE_KEY_PREFIX}${id}`);
    const battles = await this.store.mGet<Battle>(keys);

    await Promise.all(
      battleIds.map(async (id, index) => {
        const battle = battles[index];
        if (
          battle &&
          (battle.trainer1Id === trainerId || battle.trainer2Id === trainerId)
        ) {
          await this.store.del(`${BATTLE_KEY_PREFIX}${id}`);
          await this.store.sRem(BATTLES_INDEX_KEY, id);
        }
      }),
    );
  }

  /**
   * Lance un combat entre deux dresseurs
   */
  async fight(trainer1Id: number, trainer2Id: number): Promise<Battle> {
    // Validation 1 : Vérifier que les deux dresseurs existent
    const trainer1 = await this.trainersService.findOne(trainer1Id);
    if (!trainer1) {
      throw new TrainerNotFoundException(trainer1Id);
    }

    const trainer2 = await this.trainersService.findOne(trainer2Id);
    if (!trainer2) {
      throw new TrainerNotFoundException(trainer2Id);
    }

    // Validation 2 : Vérifier que ce ne sont pas les mêmes dresseurs
    if (trainer1Id === trainer2Id) {
      throw new SameTrainerException();
    }

    // Récupérer les équipes
    const team1 = await this.teamsService.getTeamByTrainerId(trainer1Id);
    const team2 = await this.teamsService.getTeamByTrainerId(trainer2Id);

    // Validation 3 : Vérifier que chaque équipe a exactement TEAM_SIZE Pokémon
    if (!team1.pokemons || team1.pokemons.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer1Id);
    }
    if (!team2.pokemons || team2.pokemons.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer2Id);
    }

    // Récupérer les Pokémon complets
    const pokemons1Promise = team1.pokemons.map((id) =>
      this.pokemonsService.findOne(id),
    );
    const pokemons2Promise = team2.pokemons.map((id) =>
      this.pokemonsService.findOne(id),
    );

    const pokemons1 = (await Promise.all(pokemons1Promise)).filter(
      (p): p is Pokemon => p !== undefined,
    );
    const pokemons2 = (await Promise.all(pokemons2Promise)).filter(
      (p): p is Pokemon => p !== undefined,
    );

    // Vérifier que tous les Pokémon ont été trouvés
    if (pokemons1.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer1Id);
    }
    if (pokemons2.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer2Id);
    }

    // Lancer le combat
    const duels: DuelResult[] = [];
    let index1 = 0;
    let index2 = 0;

    // Le combat continue tant que les deux dresseurs ont des Pokémon
    while (index1 < TEAM_SIZE && index2 < TEAM_SIZE) {
      const pokemon1 = pokemons1[index1];
      const pokemon2 = pokemons2[index2];

      const duelResult = this.duel(pokemon1, pokemon2);
      duels.push(duelResult);

      // Le perdant est éliminé, on passe au suivant
      if (duelResult.winnerId === pokemon1.pokedex_id) {
        index2++;
      } else {
        index1++;
      }
    }

    // Déterminer le gagnant : celui qui a encore des Pokémon
    const winnerId = index1 < TEAM_SIZE ? trainer1Id : trainer2Id;

    const battle: Battle = {
      trainer1Id,
      trainer2Id,
      winnerId,
      duels,
      datetime: new Date(),
    };

    // Sauvegarder le combat sous un ID unique (généré de façon atomique pour
    // éviter toute collision entre deux combats survenant à la même
    // milliseconde, ce qu'une clé basée sur la datetime ne garantissait pas)
    const newId = await this.store.incr(BATTLE_COUNTER_KEY);
    await this.store.set(`${BATTLE_KEY_PREFIX}${newId}`, battle);

    // Ajouter l'ID à l'index
    await this.store.sAdd(BATTLES_INDEX_KEY, newId.toString());

    return battle;
  }

  /**
   * Simule un duel entre deux Pokémons
   * Retourne le résultat avec le gagnant et les scores
   */
  private duel(pokemon1: Pokemon, pokemon2: Pokemon): DuelResult {
    // Calculer les scores de base en fonction des types
    const score1 = this.calculateScore(pokemon1, pokemon2);
    const score2 = this.calculateScore(pokemon2, pokemon1);

    // Ajouter une part d'aléatoire (entre 0 et 30)
    const randomFactor1 = Math.random() * 30;
    const randomFactor2 = Math.random() * 30;

    const finalScore1 = score1 + randomFactor1;
    const finalScore2 = score2 + randomFactor2;

    // Déterminer le gagnant
    if (finalScore1 > finalScore2) {
      return {
        winnerId: pokemon1.pokedex_id,
        loserId: pokemon2.pokedex_id,
        winnerScore: finalScore1,
        loserScore: finalScore2,
      };
    } else {
      return {
        winnerId: pokemon2.pokedex_id,
        loserId: pokemon1.pokedex_id,
        winnerScore: finalScore2,
        loserScore: finalScore1,
      };
    }
  }

  /**
   * Calcule le score d'un Pokémon en fonction de son avantage de type
   */
  private calculateScore(attacker: Pokemon, defender: Pokemon): number {
    let baseScore = 100; // Score de base

    // Pour chaque type de l'attaquant
    for (const attackerTypeId of attacker.types) {
      const attackerType = this.pokemonTypesService.findOne(attackerTypeId);
      if (!attackerType) continue;

      // Vérifier les résistances contre chaque type du défenseur
      for (const defenderTypeId of defender.types) {
        const defenderType = this.pokemonTypesService.findOne(defenderTypeId);
        if (!defenderType) continue;

        // Chercher la résistance du défenseur contre le type de l'attaquant
        const defenderResistance = defenderType.resistances.find(
          (r) => r.name === attackerType.name.fr,
        );

        if (defenderResistance) {
          // Multiplier :
          // 0 = immunité du défenseur,
          // 0.5 = désavantage pour l'attaquant,
          // 1 = neutre,
          // 2 = avantage pour l'attaquant
          if (defenderResistance.multiplier === 0) {
            baseScore -= 50; // Immunité
          } else if (defenderResistance.multiplier === 0.5) {
            baseScore -= 30; // Désavantage
          } else if (defenderResistance.multiplier === 2) {
            baseScore += 30; // Avantage
          }
          // Si multiplier === 1, pas de bonus/malus (neutre)
        }
      }
    }

    return baseScore;
  }
}
