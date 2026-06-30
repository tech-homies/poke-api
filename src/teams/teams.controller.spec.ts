import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamDto } from './dto/team.dto';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeam: TeamDto = {
    trainerId: 1,
    pokemons: [25, 1, 4],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: {
            getTeamByTrainerId: jest.fn(),
            updateTeamByTrainerId: jest.fn(),
            deleteTeamByTrainerId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeamByTrainerId', () => {
    it('should return a team by trainer id', async () => {
      jest.spyOn(service, 'getTeamByTrainerId').mockResolvedValue(mockTeam);

      const result = await controller.getTeamByTrainerId(1);

      expect(result).toEqual(mockTeam);
      expect(service.getTeamByTrainerId).toHaveBeenCalledWith(1);
    });
  });

  describe('updateTeamByTrainerId', () => {
    it('should update a team by trainer id', async () => {
      const updatedTeam = { ...mockTeam, pokemons: [25, 6, 9] };
      jest.spyOn(service, 'updateTeamByTrainerId').mockResolvedValue(undefined);

      await controller.updateTeamByTrainerId(1, updatedTeam);

      expect(service.updateTeamByTrainerId).toHaveBeenCalledWith(
        1,
        updatedTeam,
      );
    });
  });

  describe('deleteTeamByTrainerId', () => {
    it('should delete a team by trainer id', async () => {
      jest.spyOn(service, 'deleteTeamByTrainerId').mockResolvedValue(undefined);

      await controller.deleteTeamByTrainerId(1);

      expect(service.deleteTeamByTrainerId).toHaveBeenCalledWith(1);
    });
  });
});
