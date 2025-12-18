import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { TeamDto } from './dto/team.dto';
import { TeamSizeExceededException } from './exceptions/team-size-exceeded.exception';
import { DuplicatePokemonException } from './exceptions/duplicate-pokemon.exception';
import { TrainerIdMismatchException } from './exceptions/trainer-id-mismatch.exception';
import { TEAM_SIZE } from '../common/constants/team.constants';
import { TrainersService } from '../trainers/trainers.service';
import { TrainerNotFoundException } from '../trainers/exceptions/trainer-not-found.exception';
import { teams } from './teams.data';
import { RedisService } from '../redis/redis.service';

const TEAMS_INDEX_KEY = 'index:teams';
const TEAM_KEY_PREFIX = 'team:';

@Injectable()
export class TeamsService implements OnModuleInit {
  constructor(
    private readonly trainersService: TrainersService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // Charger les données initiales dans Redis au démarrage
    const exists = await this.redisService.exists(TEAMS_INDEX_KEY);
    if (!exists) {
      // Stocker chaque équipe individuellement
      const keyValuePairs = Object.entries(teams).map(
        ([trainerId, pokemons]) => ({
          key: `${TEAM_KEY_PREFIX}${trainerId}`,
          value: pokemons,
        }),
      );

      if (keyValuePairs.length > 0) {
        await this.redisService.mSet(keyValuePairs);

        // Maintenir un index des trainer IDs qui ont une équipe
        for (const trainerId of Object.keys(teams)) {
          await this.redisService.sAdd(TEAMS_INDEX_KEY, trainerId);
        }
      }

      console.log('✅ Données des équipes chargées dans Redis');
    }
  }

  async deleteTeamByTrainerId(trainerId: number): Promise<void> {
    await this.redisService.del(`${TEAM_KEY_PREFIX}${trainerId}`);
    await this.redisService.sRem(TEAMS_INDEX_KEY, trainerId.toString());
  }

  async updateTeamByTrainerId(
    trainerId: number,
    teamDto: TeamDto,
  ): Promise<void> {
    // Validation: vérifier que les trainerId sont cohérents
    if (trainerId !== teamDto.trainerId) {
      throw new TrainerIdMismatchException(trainerId, teamDto.trainerId);
    }

    // Validation: vérifier la taille de l'équipe (doit être exactement TEAM_SIZE)
    if (teamDto.pokemons.length > TEAM_SIZE) {
      throw new TeamSizeExceededException(TEAM_SIZE);
    }

    // Validation: vérifier qu'il n'y a pas de doublons
    if (new Set(teamDto.pokemons).size !== teamDto.pokemons.length) {
      throw new DuplicatePokemonException();
    }

    // Sauvegarder l'équipe
    await this.redisService.set(
      `${TEAM_KEY_PREFIX}${trainerId}`,
      teamDto.pokemons,
    );
    await this.redisService.sAdd(TEAMS_INDEX_KEY, trainerId.toString());
  }

  async getTeamByTrainerId(trainerId: number): Promise<TeamDto> {
    // Vérifier que le trainer existe
    const trainer = await this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    const pokemons = await this.redisService.get<Pokemon['pokedex_id'][]>(
      `${TEAM_KEY_PREFIX}${trainerId}`,
    );

    return {
      trainerId,
      pokemons: pokemons ?? [],
    };
  }
}
