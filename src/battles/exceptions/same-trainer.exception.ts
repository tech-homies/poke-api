import { BadRequestException } from '@nestjs/common';

export class SameTrainerException extends BadRequestException {
  constructor() {
    super('Un combat ne peut pas opposer le même dresseur.');
  }
}
