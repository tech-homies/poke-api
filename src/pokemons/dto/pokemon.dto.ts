import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PokemonType } from '../../pokemon-types/entities/pokemon-type.entity';

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
  @ApiProperty({ description: 'Identifiant du pokémon', example: 1 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  pokedex_id: number;

  @ApiProperty({ description: 'Génération du pokémon', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  generation: number;

  @IsString()
  category: string;

  @ApiProperty({
    description: 'Nom du pokémon',
    type: 'object',
    properties: {
      fr: {
        type: 'string',
        required: true,
        description: 'Nom du pokémon en Francais',
        example: 'Bulbizarre',
      },
      en: {
        type: 'string',
        required: true,
        description: 'Nom du pokémon en Anglais',
        example: 'Bulbasaur',
      },
      jp: {
        type: 'string',
        required: true,
        description: 'Nom du pokémon en Japonais',
        example: '\u30d5\u30b7\u30ae\u30c0\u30cd',
      },
    },
  })
  @IsNotEmpty()
  name: { fr: string; en: string; jp: string };

  sprites: {
    regular: string;
    shiny: string | null;
    gmax: {
      regular: string;
      shiny: string | null;
    } | null;
  };

  @ApiProperty({
    description: 'Types du pokémon',
    example: [1, 2],
    type: Number,
    isArray: true,
  })
  types: PokemonType['id'][];

  talents: Talent[];
  stats: Stats;
  resistances: Resistance[];
  evolution: {
    pre: { pokedex_id: number; name: string; condition: string }[];
    next: { pokedex_id: number; name: string; condition: string }[];
    mega: { orbe: string; sprites: { regular: string; shiny: string } }[];
  };

  @ApiProperty({ description: 'Taille du pokémon', example: 1 })
  height: string;

  @ApiProperty({ description: 'Poids du pokémon', example: 1 })
  weight: string;

  egg_groups: string[];

  sexe: SexeRate | null;

  catch_rate: number;

  level_100: number;

  formes: {
    region: string;
    name: { fr: string; en: string; jp: string };
  }[];
}
