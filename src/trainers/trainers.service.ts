import { Injectable, OnModuleInit } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { RedisService } from '../redis/redis.service';

const TRAINERS_INDEX_KEY = 'index:trainers';
const TRAINER_KEY_PREFIX = 'trainer:';
const TRAINER_COUNTER_KEY = 'counter:trainer_id';

@Injectable()
export class TrainersService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Charger les données initiales dans Redis au démarrage
    const exists = await this.redisService.exists(TRAINERS_INDEX_KEY);
    if (!exists) {
      // Stocker chaque Trainer individuellement
      const keyValuePairs = trainers.map((trainer) => ({
        key: `${TRAINER_KEY_PREFIX}${trainer.id}`,
        value: trainer,
      }));

      if (keyValuePairs.length > 0) {
        await this.redisService.mSet(keyValuePairs);

        // Maintenir un index des IDs existants
        for (const trainer of trainers) {
          await this.redisService.sAdd(
            TRAINERS_INDEX_KEY,
            trainer.id.toString(),
          );
        }

        // Initialiser le compteur pour les nouveaux IDs
        const maxId = Math.max(...trainers.map((t) => t.id), 0);
        await this.redisService.set(TRAINER_COUNTER_KEY, maxId);
      }

      console.log('✅ Données des dresseurs chargées dans Redis');
    }
  }

  async findAll(): Promise<Trainer[]> {
    const trainerIds = await this.redisService.sMembers(TRAINERS_INDEX_KEY);
    if (trainerIds.length === 0) return [];

    const keys = trainerIds.map((id) => `${TRAINER_KEY_PREFIX}${id}`);
    const trainers = await this.redisService.mGet<Trainer>(keys);

    return trainers.filter((trainer): trainer is Trainer => trainer !== null);
  }

  async findOne(id: number): Promise<Trainer | undefined> {
    const trainer = await this.redisService.get<Trainer>(
      `${TRAINER_KEY_PREFIX}${id}`,
    );
    return trainer ?? undefined;
  }

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    // Générer un nouvel ID
    const currentCounter =
      (await this.redisService.get<number>(TRAINER_COUNTER_KEY)) ?? 0;
    const newId = currentCounter + 1;

    const newTrainer: Trainer = {
      id: newId,
      ...createTrainerDto,
    };

    // Sauvegarder le nouveau trainer
    await this.redisService.set(`${TRAINER_KEY_PREFIX}${newId}`, newTrainer);

    // Mettre à jour l'index et le compteur
    await this.redisService.sAdd(TRAINERS_INDEX_KEY, newId.toString());
    await this.redisService.set(TRAINER_COUNTER_KEY, newId);

    return newTrainer;
  }
}
