import { Injectable } from '@nestjs/common';
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

@Injectable()
export class TeamsService {
  #teams: Record<Trainer['id'], Pokemon['pokedex_id'][]> = teams;

  constructor(private readonly trainersService: TrainersService) {}

  deleteTeamByTrainerId(trainerId: number): void {
    this.#teams[trainerId] = [];
  }

  updateTeamByTrainerId(trainerId: number, teamDto: TeamDto): void {
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

    this.#teams[trainerId] = teamDto.pokemons;
  }

  getTeamByTrainerId(trainerId: number): TeamDto {
    // Vérifier que le trainer existe
    const trainer = this.trainersService.findOne(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    return {
      trainerId,
      pokemons: this.#teams[trainerId] ?? [],
    };
  }
}
