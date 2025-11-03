import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

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
}
