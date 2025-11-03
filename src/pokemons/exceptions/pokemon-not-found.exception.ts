import { NotFoundException } from '@nestjs/common';

export class PokemonNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Le pokémon avec l'ID '${id}' n'a pas été trouvé`);
  }
}
