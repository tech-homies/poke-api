import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { TrainerDto } from './dto/trainer.dto';
import { TrainerNotFoundException } from './exceptions/trainer-not-found.exception';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @ApiOperation({ summary: 'Récupérer tous les dresseurs' })
  @ApiOkResponse({
    description: 'Liste des dresseurs récupérée avec succès',
    type: [TrainerDto],
  })
  @Get()
  findAll(): TrainerDto[] {
    return this.trainersService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un dresseur par son ID' })
  @ApiOkResponse({
    description: 'Dresseur récupéré avec succès',
    type: TrainerDto,
  })
  @ApiNotFoundResponse({
    description: "Le dresseur demandé n'a pas été trouvé",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du dresseur',
    example: 1,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): TrainerDto {
    const trainer = this.trainersService.findOne(id);
    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }
    return trainer;
  }
}
