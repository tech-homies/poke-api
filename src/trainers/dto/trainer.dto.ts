import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

export class TrainerDto {
  @ApiProperty({ description: 'Identifiant du dresseur', example: 1 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Nom du dresseur', example: 'Sacha' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "URL de l'avatar du dresseur",
    example:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/trainers/1/Sacha.webp',
  })
  @IsUrl()
  @IsNotEmpty()
  avatarUrl: string;
}
