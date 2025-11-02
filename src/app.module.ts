import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PokemonTypesModule } from './pokemon-types/pokemon-types.module';
import { PokemonsModule } from './pokemons/pokemons.module';

@Module({
  imports: [PokemonTypesModule, PokemonsModule],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
