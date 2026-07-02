# Système de Combats Pokémon

## Description

Le système de combats permet de faire s'affronter deux dresseurs (trainers) avec leurs équipes de Pokémon.

## Règles du Combat

### Prérequis
- Chaque trainer doit posséder une équipe (team) composée **exactement de 3 Pokémon**
- Les deux trainers doivent être différents

### Déroulement d'un combat

1. **Combat Pokémon par Pokémon dans l'ordre**
   - Le Pokémon n°1 du trainer A affronte le Pokémon n°1 du trainer B
   - Le gagnant du duel reste sur le terrain
   - Le perdant est éliminé et remplacé par le Pokémon suivant de son trainer
   - Le processus se répète jusqu'à ce qu'un trainer n'ait plus de Pokémon

2. **Victoire**
   - Un trainer perd lorsque ses 3 Pokémon sont K.O.
   - Le trainer dont il reste au moins 1 Pokémon est déclaré gagnant

### Détermination du gagnant d'un duel

Le résultat d'un duel entre deux Pokémon dépend de :

1. **Avantage de type** : Calcul d'un score de base en fonction des types
   - Chaque type de Pokémon a des forces et faiblesses contre d'autres types
   - Exemple : Eau > Feu, Feu > Plante, Plante > Eau
   - Le système utilise les multiplicateurs de résistance :
     - `multiplier = 2.0` : Avantage (+30 points)
     - `multiplier = 1.0` : Neutre (aucun bonus)
     - `multiplier = 0.5` : Désavantage (-30 points)

2. **Part d'aléatoire** : Ajout d'un facteur aléatoire (0-30 points)
   - Permet d'éviter que le même matchup ait toujours le même résultat
   - N'annule pas complètement l'avantage de type
   - Permet occasionnellement à un Pokémon désavantagé de gagner

3. **Score final** : Score de base + facteur aléatoire
   - Le Pokémon avec le score final le plus élevé remporte le duel

## API Endpoint

### Récupérer tous les combats

Permet de récupérer l'historique de tous les combats effectués.

```http
GET /battles
```

#### Réponse

```json
[
  {
    "trainer1Id": 1,
    "trainer2Id": 2,
    "winnerId": 1,
    "duels": [
      {
        "winner": { /* Pokémon complet */ },
        "loser": { /* Pokémon complet */ },
        "winnerScore": 125.5,
        "loserScore": 98.3
      }
      // ... autres duels
    ]
  }
  // ... autres combats
]
```

### Lancer un combat

```http
POST /battles
Content-Type: application/json

{
  "trainer1Id": 1,
  "trainer2Id": 2
}
```

### Réponse

```json
{
  "trainer1Id": 1,
  "trainer2Id": 2,
  "winnerId": 1,
  "duels": [
    {
      "winner": { /* Pokémon complet */ },
      "loser": { /* Pokémon complet */ },
      "winnerScore": 125.5,
      "loserScore": 98.3
    },
    // ... autres duels
  ]
}
```

## Exceptions

- **`TrainerNotFoundException`** : L'un des trainers n'existe pas
- **`SameTrainerException`** : Les deux trainers sont identiques
- **`TrainerNoTeamException`** : L'un des trainers n'a pas une équipe de 3 Pokémon

## Suppression en cascade

Lorsqu'un dresseur est supprimé (`DELETE /trainers/:id`), tous les combats auxquels il a participé sont automatiquement supprimés (`BattlesService.deleteByTrainerId`, appelée en interne — il n'existe pas d'endpoint public dédié).

## Architecture

```
battles/
├── battles.controller.ts     # Endpoint POST /battles
├── battles.service.ts         # Logique métier
├── battles.module.ts          # Module NestJS
├── dto/
│   ├── create-battle.dto.ts  # DTO pour créer un combat
│   └── battle.dto.ts         # DTO du résultat du combat
├── entities/
│   └── battle.entity.ts      # Entité Battle
└── exceptions/
    ├── same-trainer.exception.ts
    └── trainer-no-team.exception.ts
```

## Exemple d'utilisation

```bash
# Créer des équipes pour les trainers
curl -X PUT http://localhost:3000/trainers/1/team \
  -H "Content-Type: application/json" \
  -d '{"pokemons": [1, 4, 7]}'

curl -X PUT http://localhost:3000/trainers/2/team \
  -H "Content-Type: application/json" \
  -d '{"pokemons": [2, 5, 8]}'

# Lancer un combat
curl -X POST http://localhost:3000/battles \
  -H "Content-Type: application/json" \
  -d '{"trainer1Id": 1, "trainer2Id": 2}'

# Récupérer tous les combats
curl -X GET http://localhost:3000/battles
```
