import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PokemonDto } from './dto/pokemon.dto';
import { PokemonNotFoundException } from './exceptions/pokemon-not-found.exception';

@ApiTags('Pokemons')
@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @ApiOperation({ summary: 'Récupérer tous les pokémons' })
  @ApiOkResponse({
    description: 'Liste des pokémons récupérée avec succès',
    type: [PokemonDto],
  })
  @Get()
  async findAll(): Promise<PokemonDto[]> {
    return this.pokemonsService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un pokémon par son ID' })
  @ApiOkResponse({
    description: 'Pokémon récupéré avec succès',
    type: PokemonDto,
  })
  @ApiNotFoundResponse({
    description: "Le Pokémon demandé n'a pas été trouvé",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du pokémon',
    example: 0,
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PokemonDto> {
    const pokemon = await this.pokemonsService.findOne(id);
    if (!pokemon) {
      throw new PokemonNotFoundException(id);
    }
    return pokemon;
  }
}
