import { Trainer } from './entities/trainer.entity';

export const trainers: Trainer[] = [
  {
    id: 1,
    name: 'Sacha',
    avatarUrl:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/trainers/1/Sacha.webp',
    description:
      'Sacha Ketchum est un jeune dresseur énergique originaire de Bourg Palette. Déterminé à devenir Maître Pokémon, il parcourt les régions avec son fidèle Pikachu, se distinguant par son courage, sa persévérance et son lien unique avec ses Pokémon.',
    age: 10,
    hometown: 'Bourg Palette',
    level: 'intermediate',
    favoritePokemon: 25, // Pikachu
  },
  {
    id: 2,
    name: 'Ondine',
    avatarUrl:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/trainers/2/Ondine.png',
    description:
      "Ondine est la championne de l'arène d'Azuria, spécialisée dans les Pokémon de type Eau. Déterminée et fière de ses compétences, elle allie grâce aquatique et tactiques de combat redoutables, tout en rêvant de devenir Maître Pokémon Eau.",
    age: 12,
    hometown: 'Azuria',
    level: 'advanced',
    favoritePokemon: 121, // Starmie
  },
  {
    id: 3,
    name: 'Pierre',
    avatarUrl:
      'https://raw.githubusercontent.com/tech-homies/poke-api/refs/heads/main/src/client/assets/trainers/3/Pierre.webp',
    description:
      "Pierre est un éleveur de Pokémon et ancien champion d'Argenta. Passionné par les Pokémon de type Roche, il excelle dans les soins et l'élevage. Son rêve est de devenir le meilleur éleveur Pokémon tout en poursuivant ses recherches.",
    age: 15,
    hometown: 'Argenta',
    level: 'advanced',
    favoritePokemon: 95, // Onix
  },
];
