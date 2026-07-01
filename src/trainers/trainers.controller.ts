import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrainerDto } from './dto/trainer.dto';
import { TrainerNotFoundException } from './exceptions/trainer-not-found.exception';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@ApiTags('Trainers')
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

  @ApiOperation({ summary: 'Mettre à jour un dresseur par son ID' })
  @ApiOkResponse({
    description: 'Dresseur mis à jour avec succès',
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
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<TrainerDto> {
    return this.trainersService.update(id, updateTrainerDto);
  }

  @ApiOperation({ summary: 'Supprimer un dresseur par son ID' })
  @ApiNoContentResponse({
    description: 'Dresseur supprimé avec succès',
  })
  @ApiNotFoundResponse({
    description: "Le dresseur demandé n'a pas été trouvé",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du dresseur',
    example: 1,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trainersService.remove(id);
  }
}
