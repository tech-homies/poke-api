import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PokemonTypesModule } from './pokemon-types/pokemon-types.module';
import { PokemonTypesController } from './pokemon-types/pokemon-types.controller';
import { PokemonsModule } from './pokemons/pokemons.module';
import { PokemonsController } from './pokemons/pokemons.controller';
import { DelayMiddleware } from './middlewares/delay.middleware';
import { TrainersModule } from './trainers/trainers.module';
import { TrainersController } from './trainers/trainers.controller';
import { TeamsModule } from './teams/teams.module';
import { TeamsController } from './teams/teams.controller';
import { BattlesModule } from './battles/battles.module';
import { BattlesController } from './battles/battles.controller';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    StoreModule,
    PokemonTypesModule,
    PokemonsModule,
    TrainersModule,
    TeamsModule,
    BattlesModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // On référence directement les classes de contrôleurs (plutôt que des
    // chemins en dur) pour que ce routage ne puisse pas se désynchroniser
    // silencieusement d'un renommage de route (cf. @Controller('pokemon-types')).
    consumer
      .apply(DelayMiddleware)
      .forRoutes(
        PokemonTypesController,
        PokemonsController,
        TrainersController,
        TeamsController,
        BattlesController,
      );
  }
}
