import { forwardRef, Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TrainersModule } from '../trainers/trainers.module';

@Module({
  imports: [forwardRef(() => TrainersModule)],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
