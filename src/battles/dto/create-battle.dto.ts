import { BattleDto } from './battle.dto';
import { PickType } from '@nestjs/swagger';

export class CreateBattleDto extends PickType(BattleDto, [
  'trainer1Id',
  'trainer2Id',
]) {}
