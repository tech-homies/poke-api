import { BadRequestException } from '@nestjs/common';

export class TeamSizeExceededException extends BadRequestException {
  constructor(limit: number) {
    super(`Une équipe ne peut pas contenir plus de ${limit} pokémons`);
  }
}
