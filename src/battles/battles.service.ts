import { Injectable } from '@nestjs/common';
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

@Injectable()
export class BattlesService {
  #battles: Battle[] = [];

  constructor(
    private readonly trainersService: TrainersService,
    private readonly teamsService: TeamsService,
    private readonly pokemonsService: PokemonsService,
    private readonly pokemonTypesService: PokemonTypesService,
  ) {}

  /**
   * Récupère la liste de tous les combats
   */
  findAll(): Battle[] {
    return this.#battles;
  }

  /**
   * Récupère les combats d'un dresseur donné
   */
  findByTrainerId(trainerId: number): Battle[] {
    // Vérifier que le dresseur existe
    const trainer = this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    // Retourner tous les combats où le dresseur a participé
    return this.#battles.filter(
      (battle) =>
        battle.trainer1Id === trainerId || battle.trainer2Id === trainerId,
    );
  }

  /**
   * Lance un combat entre deux dresseurs
   */
  fight(trainer1Id: number, trainer2Id: number): Battle {
    // Validation 1 : Vérifier que les deux dresseurs existent
    const trainer1 = this.trainersService.findOne(trainer1Id);
    if (!trainer1) {
      throw new TrainerNotFoundException(trainer1Id);
    }

    const trainer2 = this.trainersService.findOne(trainer2Id);
    if (!trainer2) {
      throw new TrainerNotFoundException(trainer2Id);
    }

    // Validation 2 : Vérifier que ce ne sont pas les mêmes dresseurs
    if (trainer1Id === trainer2Id) {
      throw new SameTrainerException();
    }

    // Récupérer les équipes
    const team1 = this.teamsService.getTeamByTrainerId(trainer1Id);
    const team2 = this.teamsService.getTeamByTrainerId(trainer2Id);

    // Validation 3 : Vérifier que chaque équipe a exactement TEAM_SIZE Pokémon
    if (!team1.pokemons || team1.pokemons.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer1Id);
    }
    if (!team2.pokemons || team2.pokemons.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(trainer2Id);
    }

    // Récupérer les Pokémon complets
    const pokemons1 = team1.pokemons
      .map((id) => this.pokemonsService.findOne(id))
      .filter((p): p is Pokemon => p !== undefined);
    const pokemons2 = team2.pokemons
      .map((id) => this.pokemonsService.findOne(id))
      .filter((p): p is Pokemon => p !== undefined);

    // Vérifier que tous les Pokémon ont été trouvés
    if (pokemons1.length !== TEAM_SIZE || pokemons2.length !== TEAM_SIZE) {
      throw new TrainerNoTeamException(
        pokemons1.length !== TEAM_SIZE ? trainer1Id : trainer2Id,
      );
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
    };

    // Sauvegarder le combat dans l'historique
    this.#battles.push(battle);

    return battle;
  }

  /**
   * Simule un duel entre deux Pokémon
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
        const resistance = defenderType.resistances.find(
          (r) => r.name === attackerType.name.fr,
        );

        if (resistance) {
          // Multiplier : 0.5 = désavantage, 1 = neutre, 2 = avantage
          if (resistance.multiplier === 0.5) {
            baseScore -= 30; // Désavantage
          } else if (resistance.multiplier === 2) {
            baseScore += 30; // Avantage
          }
          // Si multiplier === 1, pas de bonus/malus (neutre)
        }
      }
    }

    return baseScore;
  }
}
