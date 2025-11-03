import { IsArray, IsInt, IsNotEmpty, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PokemonTypeDto {
  @ApiProperty({ description: 'Identifiant du type de pokémon', example: 0 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Nom du type de pokémon',
    type: 'object',
    properties: {
      fr: {
        type: 'string',
        required: true,
        description: 'Nom du type de pokémon en Francais',
        example: 'Acier',
      },
      en: {
        type: 'string',
        required: true,
        description: 'Nom du type de pokémon en Anglais',
        example: 'Steel',
      },
      jp: {
        type: 'string',
        required: true,
        description: 'Nom du type de pokémon en Japonais',
        example: '\u306f\u304c\u306d',
      },
    },
  })
  @IsNotEmpty()
  name: { fr: string; en: string; jp: string };

  @ApiProperty({
    description: `URL de l'image du type de pokémon`,
    example:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/pokemon-types/acier.png',
  })
  @IsUrl()
  @IsNotEmpty()
  sprites: string;

  @ApiProperty({
    description: 'Liste des résistances associées au type de pokémon',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nom du type de pokémon',
          example: 'Feu',
        },
        multiplier: {
          type: 'number',
          description: 'Multiplicateur de résistance',
          example: 0.5,
        },
      },
    },
    example: [
      { name: 'Feu', multiplier: 0.5 },
      { name: 'Eau', multiplier: 2 },
    ],
  })
  @IsArray()
  resistances: {
    name: string;
    multiplier: number;
  }[];
}
