import { NotFoundException } from '@nestjs/common';

export class PokemonTypeNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Le type de pokémon avec l'ID '${id}' n'a pas été trouvé`);
  }
}
