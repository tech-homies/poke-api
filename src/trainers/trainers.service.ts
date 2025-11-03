import { Injectable } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';

@Injectable()
export class TrainersService {
  #trainers: Trainer[] = trainers;

  findAll(): Trainer[] {
    return this.#trainers;
  }

  findOne(id: number): Trainer | undefined {
    return this.#trainers.find((trainer) => trainer.id === id);
  }

  create(createTrainerDto: CreateTrainerDto): Trainer {
    const newId = Math.max(...this.#trainers.map((t) => t.id), 0) + 1;
    const newTrainer: Trainer = {
      id: newId,
      ...createTrainerDto,
    };
    this.#trainers = this.#trainers.concat(newTrainer);
    return newTrainer;
  }
}
