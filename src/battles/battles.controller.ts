import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BattlesService } from './battles.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { BattleDto } from './dto/battle.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Battles')
@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @ApiOperation({
    summary: 'Récupérer tous les combats (avec filtre optionnel par dresseur)',
  })
  @ApiOkResponse({
    description: 'Liste des combats récupérée avec succès',
    type: [BattleDto],
  })
  @ApiQuery({
    name: 'trainerId',
    required: false,
    description: 'Filtrer les combats par ID du dresseur',
    example: 1,
    type: Number,
  })
  @Get()
  async findAll(
    @Query('trainerId', new ParseIntPipe({ optional: true }))
    trainerId?: number,
  ): Promise<BattleDto[]> {
    return trainerId
      ? this.battlesService.findByTrainerId(trainerId)
      : this.battlesService.findAll();
  }

  @ApiOperation({ summary: 'Lancer un combat entre deux dresseurs' })
  @ApiCreatedResponse({
    description: 'Combat créé avec succès',
    type: BattleDto,
  })
  @Post()
  async fight(@Body() createBattleDto: CreateBattleDto): Promise<BattleDto> {
    return this.battlesService.fight(
      createBattleDto.trainer1Id,
      createBattleDto.trainer2Id,
    );
  }
}
