import { Injectable } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { trainers } from './trainers.data';

@Injectable()
export class TrainersService {
  private trainers: Trainer[] = trainers;

  public findAll(): Trainer[] {
    return this.trainers;
  }

  public findOne(id: number): Trainer | undefined {
    return this.trainers.find((trainer) => trainer.id === id);
  }
}
