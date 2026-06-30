import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
  Max,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class TrainerDto {
  @ApiProperty({
    description: 'Identifiant du dresseur',
    example: 1,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Nom du dresseur',
    example: 'Sacha',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "URL de l'avatar du dresseur",
    example:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/trainers/1/Sacha.webp',
    type: 'string',
  })
  @IsUrl()
  @IsNotEmpty()
  avatarUrl: string;

  @ApiProperty({
    description: 'Description du dresseur',
    example:
      'Sacha Ketchum est un jeune dresseur énergique originaire de Bourg Palette. Déterminé à devenir Maître Pokémon, il parcourt les régions avec son fidèle Pikachu, se distinguant par son courage, sa persévérance et son lien unique avec ses Pokémon.',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Âge du dresseur',
    example: 10,
    type: 'integer',
    minimum: 5,
    maximum: 5000,
  })
  @IsInt()
  @Min(5)
  @Max(5000)
  @IsNotEmpty()
  age: number;

  @ApiProperty({
    description: "Ville d'origine du dresseur",
    example: 'Bourg Palette',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  hometown: string;

  @ApiProperty({
    description: "Niveau d'expérience du dresseur",
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced', 'master'],
  })
  @IsEnum(['beginner', 'intermediate', 'advanced', 'master'])
  @IsNotEmpty()
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';

  @ApiProperty({
    description: 'ID du Pokémon favori du dresseur',
    example: 25,
    type: 'integer',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  favoritePokemon?: number;
}
