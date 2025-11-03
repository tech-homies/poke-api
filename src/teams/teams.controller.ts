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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TeamDto } from './dto/team.dto';
import { TeamsService } from './teams.service';

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
  @Get()
  getTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
  ): TeamDto {
    return this.teamService.getTeamByTrainerId(trainerId);
  }

  @ApiOperation({ summary: "Mettre à jour l'équipe d'un dresseur par son ID" })
  @ApiNoContentResponse({
    description: "L'équipe du dresseur a été mise à jour avec succès",
  })
  @ApiBadRequestResponse({
    description:
      "La taille de l'équipe dépasse la limite autorisée ou des pokémons en double ont été détectés",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put()
  updateTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Body() teamDto: TeamDto,
  ): void {
    return this.teamService.updateTeamByTrainerId(trainerId, teamDto);
  }

  @ApiOperation({ summary: "Supprimer l'équipe d'un dresseur par son ID" })
  @ApiNoContentResponse({
    description: "L'équipe du dresseur a été supprimée avec succès",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteTeamByTrainerId(
    @Param('trainerId', ParseIntPipe) trainerId: number,
  ): void {
    return this.teamService.deleteTeamByTrainerId(trainerId);
  }
}
