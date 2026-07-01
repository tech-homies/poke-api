import { OmitType } from '@nestjs/swagger';
import { TrainerDto } from './trainer.dto';

export class UpdateTrainerDto extends OmitType(TrainerDto, ['id']) {}
