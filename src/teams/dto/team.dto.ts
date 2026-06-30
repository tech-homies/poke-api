import { PokemonDto } from '../../pokemons/dto/pokemon.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class TeamDto {
  @ApiProperty({ description: 'Identifiant du dresseur', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  trainerId: number;

  @ApiProperty({
    description: "Liste des identifiants des pokémons dans l'équipe",
    example: [1, 4, 7],
    type: 'integer',
    isArray: true,
  })
  @IsNotEmpty({ each: true })
  @IsInt({ each: true })
  @Min(0, { each: true })
  pokemons: PokemonDto['pokedex_id'][];
}
