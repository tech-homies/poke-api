import { forwardRef, Module } from '@nestjs/common';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { TeamsModule } from '../teams/teams.module';
import { BattlesModule } from '../battles/battles.module';

@Module({
  imports: [forwardRef(() => TeamsModule), forwardRef(() => BattlesModule)],
  controllers: [TrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}
