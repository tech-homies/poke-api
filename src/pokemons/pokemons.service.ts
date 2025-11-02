import { Injectable } from '@nestjs/common';
import { pokemons } from './pokemons.data';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  private pokemons: Pokemon[] = pokemons;

  public findAll(): Pokemon[] {
    return this.pokemons;
  }

  public findOne(pokedexId: number): Pokemon | undefined {
    return this.pokemons.find((pokemon) => pokemon.pokedex_id === pokedexId);
  }
}
