import { Injectable } from '@nestjs/common';
import { pokemonTypes } from './pokemon-types.data';
import { PokemonType } from './entities/pokemon-type.entity';

@Injectable()
export class PokemonTypesService {
  #pokemonTypes: PokemonType[] = pokemonTypes;

  // On retourne une copie défensive : sans cela, un appelant qui muterait le
  // tableau ou l'un de ses éléments corromprait l'état partagé du service
  // (singleton) pour toutes les requêtes suivantes.
  findAll(): PokemonType[] {
    return structuredClone(this.#pokemonTypes);
  }

  findOne(id: number): PokemonType | undefined {
    const pokemonType = this.#pokemonTypes.find(
      (pokemonType) => pokemonType.id === id,
    );
    return pokemonType ? structuredClone(pokemonType) : undefined;
  }
}
