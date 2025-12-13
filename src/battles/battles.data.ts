import { Battle } from './entities/battle.entity';

export const battles: Battle[] = [
  {
    trainer1Id: 1, // Sacha
    trainer2Id: 2, // Ondine
    winnerId: 1,
    duels: [
      {
        winnerId: 25, // Pikachu
        loserId: 54, // Psykokwak
        winnerScore: 85,
        loserScore: 45,
      },
      {
        winnerId: 25, // Pikachu
        loserId: 120, // Stari
        winnerScore: 78,
        loserScore: 62,
      },
      {
        winnerId: 6, // Dracaufeu
        loserId: 121, // Starmie
        winnerScore: 92,
        loserScore: 88,
      },
    ],
    datetime: new Date('2024-12-01T14:30:00Z'),
  },
  {
    trainer1Id: 2, // Ondine
    trainer2Id: 3, // Pierre
    winnerId: 2,
    duels: [
      {
        winnerId: 121, // Starmie
        loserId: 95, // Onix
        winnerScore: 95,
        loserScore: 72,
      },
      {
        winnerId: 9, // Tortank
        loserId: 76, // Grolem
        winnerScore: 88,
        loserScore: 65,
      },
    ],
    datetime: new Date('2024-12-02T16:45:00Z'),
  },
  {
    trainer1Id: 1, // Sacha
    trainer2Id: 3, // Pierre
    winnerId: 3,
    duels: [
      {
        winnerId: 95, // Onix
        loserId: 25, // Pikachu
        winnerScore: 85,
        loserScore: 82,
      },
      {
        winnerId: 76, // Grolem
        loserId: 6, // Dracaufeu
        winnerScore: 90,
        loserScore: 87,
      },
      {
        winnerId: 142, // Ptérodactyle
        loserId: 18, // Roucarnage
        winnerScore: 94,
        loserScore: 76,
      },
    ],
    datetime: new Date('2024-12-03T10:15:00Z'),
  },
  {
    trainer1Id: 2, // Ondine
    trainer2Id: 1, // Sacha
    winnerId: 2,
    duels: [
      {
        winnerId: 73, // Tentacruel
        loserId: 25, // Pikachu
        winnerScore: 91,
        loserScore: 89,
      },
      {
        winnerId: 121, // Starmie
        loserId: 6, // Dracaufeu
        winnerScore: 86,
        loserScore: 84,
      },
    ],
    datetime: new Date('2024-12-04T19:20:00Z'),
  },
  {
    trainer1Id: 3, // Pierre
    trainer2Id: 2, // Ondine
    winnerId: 3,
    duels: [
      {
        winnerId: 141, // Kabutops
        loserId: 54, // Psykokwak
        winnerScore: 88,
        loserScore: 45,
      },
      {
        winnerId: 95, // Onix
        loserId: 120, // Stari
        winnerScore: 75,
        loserScore: 68,
      },
      {
        winnerId: 142, // Ptérodactyle
        loserId: 73, // Tentacruel
        winnerScore: 93,
        loserScore: 90,
      },
    ],
    datetime: new Date('2024-12-05T13:30:00Z'),
  },
];
