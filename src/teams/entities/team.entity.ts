import { Pokemon } from '../../pokemons/entities/pokemon.entity';

export type Team = {
  trainerId: number;
  pokemons: Pokemon['pokedex_id'][];
};
