import { Injectable } from '@nestjs/common';
import { pokemonTypes } from './pokemon-types.data';
import { PokemonType } from './entities/pokemon-type.entity';

@Injectable()
export class PokemonTypesService {
  private pokemonTypes: PokemonType[] = pokemonTypes;

  public findAll(): PokemonType[] {
    return this.pokemonTypes;
  }

  public findOne(id: number): PokemonType | undefined {
    return this.pokemonTypes.find((pokemonType) => pokemonType.id === id);
  }
}
