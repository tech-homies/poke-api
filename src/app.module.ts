import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PokemonTypesModule } from './pokemon-types/pokemon-types.module';
import { PokemonsModule } from './pokemons/pokemons.module';
import { DelayMiddleware } from './middlewares/delay.middleware';

@Module({
  imports: [PokemonTypesModule, PokemonsModule],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DelayMiddleware).forRoutes('types', 'pokemons');
  }
}
