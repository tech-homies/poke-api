import { Injectable, OnModuleInit } from '@nestjs/common';
import { Trainer } from '../trainers/entities/trainer.entity';
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

const TEAMS_KEY = 'teams';

@Injectable()
export class TeamsService implements OnModuleInit {
  constructor(
    private readonly trainersService: TrainersService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // Charger les données initiales dans Redis au démarrage
    const exists = await this.redisService.exists(TEAMS_KEY);
    if (!exists) {
      await this.redisService.set(TEAMS_KEY, teams);
      console.log('✅ Données des équipes chargées dans Redis');
    }
  }

  async deleteTeamByTrainerId(trainerId: number): Promise<void> {
    const teams = await this.getAllTeams();
    teams[trainerId] = [];
    await this.redisService.set(TEAMS_KEY, teams);
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
    if (teamDto.pokemons.length !== TEAM_SIZE) {
      throw new TeamSizeExceededException(TEAM_SIZE);
    }

    // Validation: vérifier qu'il n'y a pas de doublons
    if (new Set(teamDto.pokemons).size !== teamDto.pokemons.length) {
      throw new DuplicatePokemonException();
    }

    const teams = await this.getAllTeams();
    teams[trainerId] = teamDto.pokemons;
    await this.redisService.set(TEAMS_KEY, teams);
  }

  async getTeamByTrainerId(trainerId: number): Promise<TeamDto> {
    // Vérifier que le trainer existe
    const trainer = await this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    const teams = await this.getAllTeams();
    return {
      trainerId,
      pokemons: teams[trainerId] ?? [],
    };
  }

  private async getAllTeams(): Promise<
    Record<Trainer['id'], Pokemon['pokedex_id'][]>
  > {
    const data =
      await this.redisService.get<
        Record<Trainer['id'], Pokemon['pokedex_id'][]>
      >(TEAMS_KEY);
    return data ?? {};
  }
}
