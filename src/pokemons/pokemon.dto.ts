type Locale = 'fr' | 'en' | 'jp';

export type Stats = {
  hp: number;
  atk: number;
  def: number;
  spe_atk: number;
  spe_def: number;
  vit: number;
};

export type Talent = {
  name: string;
  tc: boolean;
};

export type Resistance = {
  name: string;
  multiplier: number;
};

export type SexeRate = {
  male: number;
  female: number;
};

export class PokemonDto {
  pokedex_id: number;
  generation: number;
  category: string;
  name: Record<Locale, string>;
  sprites: {
    regular: string;
    shiny: string | null;
    gmax: {
      regular: string;
      shiny: string | null;
    } | null;
  };
  types: { name: string; image: string }[];
  talents: Talent[];
  stats: Stats;
  resistances: Resistance[];
  evolution: {
    pre: { pokedex_id: number; name: string; condition: string }[];
    next: { pokedex_id: number; name: string; condition: string }[];
    mega: { orbe: string; sprites: { regular: string; shiny: string } }[];
  };
  height: string;
  weight: string;
  egg_groups: string[];
  sexe: SexeRate | null;
  catch_rate: number;
  level_100: number;
  formes: { region: string; name: Record<Locale, string> }[];
}
