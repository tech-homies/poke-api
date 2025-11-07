import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class DuelResult {
  @ApiProperty({
    description: 'Identifiant du Pokémon gagnant du duel',
    example: 1,
  })
  winnerId: number;

  @ApiProperty({
    description: 'Identifiant du Pokémon perdant du duel',
    example: 2,
  })
  loserId: number;

  @ApiProperty({
    description: 'Score du pokémon gagnant',
    example: 150,
  })
  winnerScore: number;

  @ApiProperty({
    description: 'Score du pokémon perdant',
    example: 120,
  })
  loserScore: number;
}

export class BattleDto {
  @ApiProperty({
    description: 'Identifiant du premier dresseur',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  trainer1Id: number;

  @ApiProperty({
    description: 'Identifiant du second dresseur',
    example: 2,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  trainer2Id: number;

  @ApiProperty({
    description: 'Identifiant du dresseur gagnant',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  winnerId: number;

  @ApiProperty({
    description: 'Liste des résultats des duels de la bataille',
    type: [DuelResult],
    isArray: true,
  })
  duels: DuelResult[];
}
