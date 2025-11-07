import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PokemonTypeDto } from './dto/pokemon-type.dto';
import { PokemonTypesService } from './pokemon-types.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { PokemonTypeNotFoundException } from './exceptions/pokemon-type-not-found.exception';

@Controller('pokemon-types')
export class PokemonTypesController {
  constructor(private readonly pokemonTypesService: PokemonTypesService) {}

  @ApiOperation({ summary: 'Récupérer tous les types de pokémon' })
  @ApiOkResponse({
    description: 'Liste des types de pokémon récupérée avec succès',
    type: [PokemonTypeDto],
  })
  @Get()
  findAll(): PokemonTypeDto[] {
    return this.pokemonTypesService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un type de pokémon par son ID' })
  @ApiOkResponse({
    description: 'Détails du type de pokémon récupérés avec succès',
    type: PokemonTypeDto,
  })
  @ApiNotFoundResponse({
    description: "Le type de pokémon demandé n'a pas été trouvé",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du type de pokémon',
    example: 0,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): PokemonTypeDto {
    const pokemonType = this.pokemonTypesService.findOne(id);
    if (!pokemonType) {
      throw new PokemonTypeNotFoundException(id);
    }
    return pokemonType;
  }
}
