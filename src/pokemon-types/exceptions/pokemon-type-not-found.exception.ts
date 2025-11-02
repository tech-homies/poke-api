export class PokemonTypeNotFoundException extends Error {
  constructor(id: number) {
    super(`Le type de pokémon avec l'ID '${id}' n'a pas été trouvé`);
  }
}
