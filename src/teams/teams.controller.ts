import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TeamDto } from './dto/team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('trainers/:trainerId/team')
@ApiParam({
  name: 'trainerId',
  description: 'ID du dresseur',
  example: 1,
})
export class TeamsController {
  constructor(private readonly teamService: TeamsService) {}

  @ApiOperation({ summary: "Récupérer l'équipe d'un dresseur par son ID" })
  @ApiOkResponse({
    description: "L'équipe du dresseur a été récupérée avec succès",
    type: TeamDto,
  })
  @ApiNotFoundResponse({
    description: "Le dresseur demandé n'a pas été trouvé",
  })
  @Get()
  async getTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
  ): Promise<TeamDto> {
    return this.teamService.getTeamByTrainerId(trainerId);
  }

  @ApiOperation({ summary: "Mettre à jour l'équipe d'un dresseur par son ID" })
  @ApiNoContentResponse({
    description: "L'équipe du dresseur a été mise à jour avec succès",
  })
  @ApiNotFoundResponse({
    description: "Le dresseur demandé n'a pas été trouvé",
  })
  @ApiBadRequestResponse({
    description: "La taille de l'équipe dépasse la limite autorisée",
  })
  @ApiConflictResponse({
    description: "Un pokémon est présent plusieurs fois dans l'équipe",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put()
  async updateTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<void> {
    return this.teamService.updateTeamByTrainerId(trainerId, updateTeamDto);
  }

  @ApiOperation({ summary: "Supprimer l'équipe d'un dresseur par son ID" })
  @ApiNoContentResponse({
    description: "L'équipe du dresseur a été supprimée avec succès",
  })
  @ApiNotFoundResponse({
    description: "Le dresseur demandé n'a pas été trouvé",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async deleteTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
  ): Promise<void> {
    return this.teamService.deleteTeamByTrainerId(trainerId);
  }
}
