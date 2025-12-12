import { Pokemon } from '../../pokemons/entities/pokemon.entity';

export type Trainer = {
  id: number;
  name: string;
  avatarUrl: string;
  description: string;
  age: number;
  hometown: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  favoritePokemon?: Pokemon['pokedex_id'];
};
