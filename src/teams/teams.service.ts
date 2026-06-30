import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { TeamDto } from './dto/team.dto';
import { TeamSizeExceededException } from './exceptions/team-size-exceeded.exception';
import { DuplicatePokemonException } from './exceptions/duplicate-pokemon.exception';
import { TrainerIdMismatchException } from './exceptions/trainer-id-mismatch.exception';
import { TEAM_SIZE } from '../common/constants/team.constants';
import { TrainersService } from '../trainers/trainers.service';
import { TrainerNotFoundException } from '../trainers/exceptions/trainer-not-found.exception';
import { teams } from './teams.data';
import { InMemoryStoreService } from '../store/in-memory-store.service';

const TEAMS_INDEX_KEY = 'index:teams';
const TEAM_KEY_PREFIX = 'team:';

@Injectable()
export class TeamsService implements OnModuleInit {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly trainersService: TrainersService,
    private readonly store: InMemoryStoreService,
  ) {}

  async onModuleInit() {
    // Charger les données initiales en mémoire au démarrage
    const exists = await this.store.exists(TEAMS_INDEX_KEY);
    if (!exists) {
      // Stocker chaque équipe individuellement
      const keyValuePairs = Object.entries(teams).map(
        ([trainerId, pokemons]) => ({
          key: `${TEAM_KEY_PREFIX}${trainerId}`,
          value: pokemons,
        }),
      );

      if (keyValuePairs.length > 0) {
        await this.store.mSet(keyValuePairs);

        // Maintenir un index des trainer IDs qui ont une équipe
        for (const trainerId of Object.keys(teams)) {
          await this.store.sAdd(TEAMS_INDEX_KEY, trainerId);
        }
      }

      this.logger.log('✅ Données des équipes chargées en mémoire');
    }
  }

  async deleteTeamByTrainerId(trainerId: number): Promise<void> {
    await this.ensureTrainerExists(trainerId);

    await this.store.del(`${TEAM_KEY_PREFIX}${trainerId}`);
    await this.store.sRem(TEAMS_INDEX_KEY, trainerId.toString());
  }

  async updateTeamByTrainerId(
    trainerId: number,
    teamDto: TeamDto,
  ): Promise<void> {
    await this.ensureTrainerExists(trainerId);

    // Validation: vérifier que les trainerId sont cohérents
    if (trainerId !== teamDto.trainerId) {
      throw new TrainerIdMismatchException(trainerId, teamDto.trainerId);
    }

    // Validation: vérifier la taille de l'équipe (une équipe partielle est
    // autorisée, par ex. pendant sa constitution, mais ne doit jamais
    // dépasser TEAM_SIZE — seul un combat exige une équipe complète, voir
    // BattlesService.fight)
    if (teamDto.pokemons.length > TEAM_SIZE) {
      throw new TeamSizeExceededException(TEAM_SIZE);
    }

    // Validation: vérifier qu'il n'y a pas de doublons
    if (new Set(teamDto.pokemons).size !== teamDto.pokemons.length) {
      throw new DuplicatePokemonException();
    }

    // Sauvegarder l'équipe
    await this.store.set(`${TEAM_KEY_PREFIX}${trainerId}`, teamDto.pokemons);
    await this.store.sAdd(TEAMS_INDEX_KEY, trainerId.toString());
  }

  async getTeamByTrainerId(trainerId: number): Promise<TeamDto> {
    await this.ensureTrainerExists(trainerId);

    const pokemons = await this.store.get<Pokemon['pokedex_id'][]>(
      `${TEAM_KEY_PREFIX}${trainerId}`,
    );

    return {
      trainerId,
      pokemons: pokemons ?? [],
    };
  }

  private async ensureTrainerExists(trainerId: number): Promise<void> {
    const trainer = await this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }
  }
}
