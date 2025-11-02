export class TrainerNotFoundException extends Error {
  constructor(id: number) {
    super(`Le dresseur avec l'ID '${id}' n'a pas été trouvé`);
  }
}
