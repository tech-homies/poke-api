export type PokemonType = {
  id: number;
  name: { fr: string; en: string; jp: string };
  sprites: string;
  resistances: {
    name: string;
    multiplier: number;
  }[];
};
