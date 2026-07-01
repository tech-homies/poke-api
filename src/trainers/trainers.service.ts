import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { trainers } from './trainers.data';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { Store } from '../store/store';

const TRAINERS_INDEX_KEY = 'index:trainers';
const TRAINER_KEY_PREFIX = 'trainer:';
const TRAINER_COUNTER_KEY = 'counter:trainer_id';

@Injectable()
export class TrainersService implements OnModuleInit {
  private readonly logger = new Logger(TrainersService.name);

  constructor(private readonly store: Store) {}

  async onModuleInit() {
    // Charger les données initiales en mémoire au démarrage
    const exists = await this.store.exists(TRAINERS_INDEX_KEY);
    if (!exists) {
      // Stocker chaque Trainer individuellement
      const keyValuePairs = trainers.map((trainer) => ({
        key: `${TRAINER_KEY_PREFIX}${trainer.id}`,
        value: trainer,
      }));

      if (keyValuePairs.length > 0) {
        await this.store.mSet(keyValuePairs);

        // Maintenir un index des IDs existants
        for (const trainer of trainers) {
          await this.store.sAdd(TRAINERS_INDEX_KEY, trainer.id.toString());
        }

        // Initialiser le compteur pour les nouveaux IDs
        const maxId = Math.max(...trainers.map((t) => t.id), 0);
        await this.store.set(TRAINER_COUNTER_KEY, maxId);
      }

      this.logger.log('✅ Données des dresseurs chargées en mémoire');
    }
  }

  async findAll(): Promise<Trainer[]> {
    const trainerIds = await this.store.sMembers(TRAINERS_INDEX_KEY);
    if (trainerIds.length === 0) return [];

    const keys = trainerIds.map((id) => `${TRAINER_KEY_PREFIX}${id}`);
    const trainers = await this.store.mGet<Trainer>(keys);

    return trainers.filter((trainer): trainer is Trainer => trainer !== null);
  }

  async findOne(id: number): Promise<Trainer | undefined> {
    const trainer = await this.store.get<Trainer>(`${TRAINER_KEY_PREFIX}${id}`);
    return trainer ?? undefined;
  }

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    // Générer un nouvel ID de façon atomique (évite toute collision en cas
    // de requêtes concurrentes)
    const newId = await this.store.incr(TRAINER_COUNTER_KEY);

    const newTrainer: Trainer = {
      id: newId,
      ...createTrainerDto,
    };

    // Sauvegarder le nouveau trainer
    await this.store.set(`${TRAINER_KEY_PREFIX}${newId}`, newTrainer);

    // Mettre à jour l'index
    await this.store.sAdd(TRAINERS_INDEX_KEY, newId.toString());

    return newTrainer;
  }
}
