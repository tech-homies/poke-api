import { Injectable, OnModuleInit } from '@nestjs/common';
import { pokemons } from './pokemons.data';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';

const POKEMONS_KEY = 'pokemons';

@Injectable()
export class PokemonsService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Charger les données initiales dans Redis au démarrage
    const exists = await this.redisService.exists(POKEMONS_KEY);
    if (!exists) {
      await this.redisService.set(POKEMONS_KEY, pokemons);
      console.log('✅ Données des Pokémons chargées dans Redis');
    }
  }

  async findAll(): Promise<Pokemon[]> {
    const data = await this.redisService.get<Pokemon[]>(POKEMONS_KEY);
    return data ?? [];
  }

  async findOne(pokedexId: number): Promise<Pokemon | undefined> {
    const pokemons = await this.findAll();
    return pokemons.find((pokemon) => pokemon.pokedex_id === pokedexId);
  }
}
