import { Pokemon } from '../../pokemons/entities/pokemon.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';

export type DuelResult = {
  winnerId: Pokemon['pokedex_id'];
  loserId: Pokemon['pokedex_id'];
  winnerScore: number;
  loserScore: number;
};

export type Battle = {
  trainer1Id: Trainer['id'];
  trainer2Id: Trainer['id'];
  winnerId: Trainer['id'];
  duels: DuelResult[];
  datetime: Date;
};
