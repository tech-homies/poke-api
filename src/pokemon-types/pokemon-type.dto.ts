type Locale = 'fr' | 'en' | 'jp';

export class PokemonTypeDto {
  id: number;
  name: Record<Locale, string>;
  sprites: string;
  resistances: {
    name: string;
    multiplier: number;
  }[];
}
