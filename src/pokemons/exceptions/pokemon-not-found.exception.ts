export class PokemonNotFoundException extends Error {
  constructor(id: number) {
    super(`Le pokémon avec l'ID '${id}' n'a pas été trouvé`);
  }
}
