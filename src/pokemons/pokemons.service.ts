import { Injectable } from '@nestjs/common';
import { pokemons } from './pokemons.data';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  #pokemons: Pokemon[] = pokemons;

  findAll(): Pokemon[] {
    return this.#pokemons;
  }

  findOne(pokedexId: number): Pokemon | undefined {
    return this.#pokemons.find((pokemon) => pokemon.pokedex_id === pokedexId);
  }
}
