import { OmitType } from '@nestjs/swagger';
import { TeamDto } from './team.dto';

export class UpdateTeamDto extends OmitType(TeamDto, ['trainerId']) {}
