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

  @ApiProperty({
    description: 'Catégorie du pokémon (ex: Graine, Lézard)',
    example: 'Graine',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Nom du pokémon localisé',
    type: 'object',
    properties: {
      fr: {
        type: 'string',
        description: 'Nom en français',
        example: 'Bulbizarre',
      },
      en: {
        type: 'string',
        description: 'Nom en anglais',
        example: 'Bulbasaur',
      },
      jp: {
        type: 'string',
        description: 'Nom en japonais',
        example: '\u30d5\u30b7\u30ae\u30c0\u30cd',
      },
    },
  })
  @IsNotEmpty()
  name: { fr: string; en: string; jp: string };

  @ApiProperty({
    description: 'URLs des sprites du pokémon (images)',
    type: 'object',
    properties: {
      regular: {
        type: 'string',
        description: 'Sprite normal',
        example:
          'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/pokemons/1/regular.png',
      },
      shiny: {
        type: 'string',
        nullable: true,
        description: 'Sprite chromatique (ou null)',
        example:
          'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/pokemons/1/shiny.png',
      },
      gmax: {
        type: 'object',
        nullable: true,
        properties: {
          regular: {
            type: 'string',
            description: 'Sprite Gigamax normal',
            example:
              'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/pokemons/3/gmax-regular.png',
          },
          shiny: {
            type: 'string',
            nullable: true,
            description: 'Sprite Gigamax chromatique (ou null)',
            example: null,
          },
        },
      },
    },
  })
  sprites: {
    regular: string;
    shiny: string | null;
    gmax: {
      regular: string;
      shiny: string | null;
    } | null;
  };

  @ApiProperty({
    description: 'Types du pokémon (références par id)',
    example: [1, 2],
    type: Number,
    isArray: true,
  })
  types: PokemonType['id'][];

  @ApiProperty({
    description: 'Talents du pokémon',
    isArray: true,
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Overgrow' },
      tc: { type: 'boolean', example: false },
    },
    example: [{ name: 'Overgrow', tc: false }],
  })
  talents: Talent[];

  @ApiProperty({
    description: 'Statistiques de base du pokémon (valeurs entières)',
    type: 'object',
    properties: {
      hp: { type: 'number', example: 45 },
      atk: { type: 'number', example: 49 },
      def: { type: 'number', example: 49 },
      spe_atk: { type: 'number', example: 65 },
      spe_def: { type: 'number', example: 65 },
      vit: { type: 'number', example: 45 },
    },
  })
  stats: Stats;

  @ApiProperty({
    description: 'Résistances et faiblesses avec multiplicateur (ex: 0.5, 2)',
    isArray: true,
    type: 'object',
    properties: {
      name: { type: 'string' },
      multiplier: { type: 'number', example: 0.5 },
    },
    example: [
      { name: 'Feu', multiplier: 2 },
      { name: 'Plante', multiplier: 0.5 },
    ],
  })
  resistances: Resistance[];

  @ApiProperty({
    description:
      "Chaîne d'évolution: précédentes, suivantes et éventuelles méga-évolutions",
    type: 'object',
    properties: {
      pre: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pokedex_id: { type: 'number' },
            name: { type: 'string' },
            condition: { type: 'string' },
          },
        },
      },
      next: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pokedex_id: { type: 'number' },
            name: { type: 'string' },
            condition: { type: 'string' },
          },
        },
      },
      mega: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            orbe: { type: 'string' },
            sprites: {
              type: 'object',
              properties: {
                regular: { type: 'string' },
                shiny: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  evolution: {
    pre: { pokedex_id: number; name: string; condition: string }[];
    next: { pokedex_id: number; name: string; condition: string }[];
    mega: { orbe: string; sprites: { regular: string; shiny: string } }[];
  };

  @ApiProperty({ description: 'Taille du pokémon (en m)', example: '0.7' })
  height: string;

  @ApiProperty({ description: 'Poids du pokémon (en kg)', example: '6.9' })
  weight: string;

  @ApiProperty({
    description: "Groupes d'œufs",
    isArray: true,
    type: String,
    example: ['Monstre', 'Plante'],
  })
  egg_groups: string[];

  @ApiProperty({
    description: 'Taux de répartition par sexe (ou null si pas de sexe)',
    type: 'object',
    nullable: true,
    properties: {
      male: { type: 'number', example: 87.5 },
      female: { type: 'number', example: 12.5 },
    },
    example: { male: 87.5, female: 12.5 },
  })
  sexe: SexeRate | null;

  @ApiProperty({
    description: 'Taux de capture (valeur de 0 à 255 selon la génération)',
    example: 45,
  })
  catch_rate: number;

  @ApiProperty({
    description:
      'Niveau approximatif nécessaire pour que le pokémon soit au niveau 100 (valeur indicative)',
    example: 100,
  })
  level_100: number;

  @ApiProperty({
    description: 'Formes alternatives du pokémon (région et nom localisé)',
    isArray: true,
    type: 'object',
    properties: {
      region: { type: 'string', example: 'Hisui' },
      name: {
        type: 'object',
        properties: {
          fr: { type: 'string' },
          en: { type: 'string' },
          jp: { type: 'string' },
        },
      },
    },
  })
  formes: {
    region: string;
    name: { fr: string; en: string; jp: string };
  }[];
}
