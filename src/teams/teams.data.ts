import { Trainer } from '../trainers/entities/trainer.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';

export const teams: Record<Trainer['id'], Pokemon['pokedex_id'][]> = {
  1: [25, 6, 9],
  2: [120, 121, 54],
  3: [95, 74, 208],
};
