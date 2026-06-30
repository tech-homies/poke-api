import { Injectable, OnModuleInit } from '@nestjs/common';
import { pokemons } from './pokemons.data';
import { Pokemon } from './entities/pokemon.entity';
import { InMemoryStoreService } from '../store/in-memory-store.service';

const POKEMONS_INDEX_KEY = 'index:pokemons';
const POKEMON_KEY_PREFIX = 'pokemon:';

@Injectable()
export class PokemonsService implements OnModuleInit {
  constructor(private readonly store: InMemoryStoreService) {}

  async onModuleInit() {
    // Charger les données initiales en mémoire au démarrage
    const exists = await this.store.exists(POKEMONS_INDEX_KEY);
    if (!exists) {
      // Stocker chaque Pokémon individuellement
      const keyValuePairs = pokemons.map((pokemon) => ({
        key: `${POKEMON_KEY_PREFIX}${pokemon.pokedex_id}`,
        value: pokemon,
      }));

      if (keyValuePairs.length > 0) {
        await this.store.mSet(keyValuePairs);

        // Maintenir un index des IDs existants
        for (const pokemon of pokemons) {
          await this.store.sAdd(
            POKEMONS_INDEX_KEY,
            pokemon.pokedex_id.toString(),
          );
        }
      }

      console.log('✅ Données des Pokémons chargées en mémoire');
    }
  }

  async findAll(): Promise<Pokemon[]> {
    const pokemonIds = await this.store.sMembers(POKEMONS_INDEX_KEY);
    if (pokemonIds.length === 0) return [];

    const keys = pokemonIds.map((id) => `${POKEMON_KEY_PREFIX}${id}`);
    const pokemons = await this.store.mGet<Pokemon>(keys);

    return pokemons.filter((pokemon): pokemon is Pokemon => pokemon !== null);
  }

  async findOne(pokedexId: number): Promise<Pokemon | undefined> {
    const pokemon = await this.store.get<Pokemon>(
      `${POKEMON_KEY_PREFIX}${pokedexId}`,
    );
    return pokemon ?? undefined;
  }
}
