import { Module } from '@nestjs/common';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { TrainersModule } from '../trainers/trainers.module';
import { TeamsModule } from '../teams/teams.module';
import { PokemonsModule } from '../pokemons/pokemons.module';
import { PokemonTypesModule } from '../pokemon-types/pokemon-types.module';

@Module({
  imports: [TrainersModule, TeamsModule, PokemonsModule, PokemonTypesModule],
  controllers: [BattlesController],
  providers: [BattlesService],
  exports: [BattlesService],
})
export class BattlesModule {}
