import { Injectable } from '@nestjs/common';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';
import { TeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  private teams: Record<Trainer['id'], Pokemon['pokedex_id'][]> = [];

  deleteTeamByTrainerId(trainerId: number): void {
    this.teams[trainerId] = [];
  }

  updateTeamByTrainerId(trainerId: number, teamDto: TeamDto): void {
    this.teams[trainerId] = teamDto.pokemons;
  }

  getTeamByTrainerId(trainerId: number): TeamDto {
    return {
      trainerId,
      pokemons: this.teams[trainerId],
    };
  }
}
