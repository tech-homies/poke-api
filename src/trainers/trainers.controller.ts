import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TrainerDto } from './dto/trainer.dto';
import { TrainerNotFoundException } from './exceptions/trainer-not-found.exception';
import { CreateTrainerDto } from './dto/create-trainer.dto';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @ApiOperation({ summary: 'Récupérer tous les dresseurs' })
  @ApiOkResponse({
    description: 'Liste des dresseurs récupérée avec succès',
    type: [TrainerDto],
  })
  @Get()
  async findAll(): Promise<TrainerDto[]> {
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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TrainerDto> {
    const trainer = await this.trainersService.findOne(id);
    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }
    return trainer;
  }

  @ApiOperation({ summary: 'Créer un nouveau dresseur' })
  @ApiCreatedResponse({
    description: 'Dresseur créé avec succès',
    type: TrainerDto,
  })
  @Post()
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerDto> {
    return this.trainersService.create(createTrainerDto);
  }
}
