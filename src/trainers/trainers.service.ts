import { Injectable, OnModuleInit } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { RedisService } from '../redis/redis.service';

const TRAINERS_KEY = 'trainers';

@Injectable()
export class TrainersService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Charger les données initiales dans Redis au démarrage
    const exists = await this.redisService.exists(TRAINERS_KEY);
    if (!exists) {
      await this.redisService.set(TRAINERS_KEY, trainers);
      console.log('✅ Données des dresseurs chargées dans Redis');
    }
  }

  async findAll(): Promise<Trainer[]> {
    const data = await this.redisService.get<Trainer[]>(TRAINERS_KEY);
    return data ?? [];
  }

  async findOne(id: number): Promise<Trainer | undefined> {
    const trainers = await this.findAll();
    return trainers.find((trainer) => trainer.id === id);
  }

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const trainers = await this.findAll();
    const newId = Math.max(...trainers.map((t) => t.id), 0) + 1;
    const newTrainer: Trainer = {
      id: newId,
      ...createTrainerDto,
    };
    const updatedTrainers = trainers.concat(newTrainer);
    await this.redisService.set(TRAINERS_KEY, updatedTrainers);
    return newTrainer;
  }
}
