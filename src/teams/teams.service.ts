import { Injectable } from '@nestjs/common';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { TeamDto } from './dto/team.dto';
import { TeamSizeExceededException } from './exceptions/team-size-exceeded.exception';
import { DuplicatePokemonException } from './exceptions/duplicate-pokemon.exception';

@Injectable()
export class TeamsService {
  #teams: Record<Trainer['id'], Pokemon['pokedex_id'][]> = [];

  deleteTeamByTrainerId(trainerId: number): void {
    this.#teams[trainerId] = [];
  }

  updateTeamByTrainerId(trainerId: number, teamDto: TeamDto): void {
    // Validation: vérifier la taille de l'équipe
    if (teamDto.pokemons.length > 3) {
      throw new TeamSizeExceededException(3);
    }

    // Validation: vérifier qu'il n'y a pas de doublons
    if (new Set(teamDto.pokemons).size !== teamDto.pokemons.length) {
      throw new DuplicatePokemonException();
    }

    this.#teams[trainerId] = teamDto.pokemons;
  }

  getTeamByTrainerId(trainerId: number): TeamDto {
    return {
      trainerId,
      pokemons: this.#teams[trainerId],
    };
  }
}
