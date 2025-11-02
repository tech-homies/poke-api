import { ConflictException } from '@nestjs/common';

export class DuplicatePokemonException extends ConflictException {
  constructor() {
    super('Un pokémon ne peut pas être ajouté deux fois dans la même équipe');
  }
}
