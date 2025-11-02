import { OmitType } from '@nestjs/swagger';
import { TrainerDto } from './trainer.dto';

export class CreateTrainerDto extends OmitType(TrainerDto, ['id']) {}
