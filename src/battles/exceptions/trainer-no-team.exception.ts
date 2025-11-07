import { BadRequestException } from '@nestjs/common';

export class TrainerNoTeamException extends BadRequestException {
  constructor(trainerId: number) {
    super(`Le dresseur ${trainerId} n'a pas d'équipe de 3 Pokémon.`);
  }
}
