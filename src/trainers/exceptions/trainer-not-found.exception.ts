import { NotFoundException } from '@nestjs/common';

export class TrainerNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Le dresseur avec l'ID '${id}' n'a pas été trouvé`);
  }
}
