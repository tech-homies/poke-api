import { BadRequestException } from '@nestjs/common';

export class TrainerIdMismatchException extends BadRequestException {
  constructor(pathTrainerId: number, bodyTrainerId: number) {
    super(
      `L'ID du dresseur dans l'URL (${pathTrainerId}) ne correspond pas à l'ID dans le corps de la requête (${bodyTrainerId})`,
    );
  }
}
