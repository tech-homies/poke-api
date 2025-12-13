# Structure Redis - Bonnes Pratiques

Ce document décrit la nouvelle structure Redis implémentée pour l'API Pokémon, suivant les bonnes pratiques Redis.

## 🎯 Objectifs de la migration

- **Séparation des collections** : Chaque collection utilise des clés individuelles au lieu d'une seule clé monolithique
- **Performance améliorée** : Accès direct aux entités sans avoir à charger toute la collection
- **Scalabilité** : Structure qui peut gérer un grand nombre d'entités
- **Lisibilité** : Clés explicites et bien structurées

## 🗂️ Structure des clés

### 1. Collections Pokémon
```
pokemon:<pokedex_id>     # Données d'un Pokémon individuel
index:pokemons           # Set contenant tous les IDs de Pokémons
```

**Exemple :**
```
pokemon:1                # Données de Bulbasaur
pokemon:25               # Données de Pikachu
index:pokemons           # Set: ["1", "25", "150", ...]
```

### 2. Collections Trainers (Dresseurs)
```
trainer:<id>             # Données d'un dresseur individuel
index:trainers           # Set contenant tous les IDs de dresseurs
counter:trainer_id       # Compteur pour générer de nouveaux IDs
```

**Exemple :**
```
trainer:1                # Données du dresseur ID 1
trainer:42               # Données du dresseur ID 42
index:trainers           # Set: ["1", "42", "100", ...]
counter:trainer_id       # Valeur: 150 (prochain ID = 151)
```

### 3. Collections Teams (Équipes)
```
team:<trainer_id>        # Équipe d'un dresseur spécifique
index:teams              # Set contenant les IDs des dresseurs ayant une équipe
```

**Exemple :**
```
team:1                   # Équipe du dresseur ID 1: [25, 150, 144, 59, 131, 143]
team:42                  # Équipe du dresseur ID 42: [1, 4, 7, 25, 94, 150]
index:teams              # Set: ["1", "42", "100", ...]
```

### 4. Collections Battles (Combats)
```
battle:<datetime_iso>    # Données d'un combat individuel (clé = datetime)
index:battles            # Set contenant toutes les clés datetime des combats
```

**Exemple :**
```
battle:2025-12-13T14:30:45.123Z    # Données du combat du 13/12/2025 14:30:45
battle:2025-12-13T15:15:20.456Z    # Données du combat du 13/12/2025 15:15:20
index:battles                      # Set: ["2025-12-13T14:30:45.123Z", ...]
```

## 🚀 Avantages de cette approche

### Performance
- **Accès O(1)** : Récupération directe d'une entité par sa clé
- **Chargement partiel** : Possibilité de charger seulement les entités nécessaires
- **Opérations en lot** : Utilisation de `MGET` pour récupérer plusieurs entités

### Scalabilité
- **Pas de limite de taille** : Chaque collection peut grandir indépendamment
- **Mémoire optimisée** : Les entités non utilisées ne sont pas chargées
- **Parallélisation** : Opérations simultanées sur différentes entités

### Maintenabilité
- **Clés explicites** : Structure claire et compréhensible
- **Séparation des concerns** : Chaque collection est indépendante
- **Debug facile** : Inspection directe des entités via leurs clés

## 🛠️ Patterns utilisés

### 1. Namespace Pattern
Utilisation de préfixes pour organiser les clés :
```
<type>:<identifier>
```

### 2. Index Pattern  
Maintien d'un set pour lister toutes les entités d'un type :
```
index:<collection_name>
```

### 3. Counter Pattern
Utilisation d'un compteur pour les IDs auto-incrémentés :
```
counter:<entity>_id
```

### 4. Date-based Key Pattern (pour les battles)
Utilisation de l'ISO timestamp comme clé unique :
```
<type>:<iso_datetime>
```

## 🔧 Opérations supportées

### Lecture
```typescript
// Récupérer un Pokémon
const pokemon = await redisService.get<Pokemon>('pokemon:25');

// Récupérer tous les Pokémons
const pokemonIds = await redisService.sMembers('index:pokemons');
const keys = pokemonIds.map(id => `pokemon:${id}`);
const pokemons = await redisService.mGet<Pokemon>(keys);
```

### Écriture
```typescript
// Ajouter un nouveau trainer
const newId = await redisService.get<number>('counter:trainer_id') + 1;
await redisService.set(`trainer:${newId}`, newTrainer);
await redisService.sAdd('index:trainers', newId.toString());
await redisService.set('counter:trainer_id', newId);
```

### Suppression
```typescript
// Supprimer une équipe
await redisService.del('team:42');
await redisService.sRem('index:teams', '42');
```

## 🧪 Scripts utilitaires

### Nettoyage de la base
```bash
node scripts/clean-redis.js
```

### Inspection de la structure
```bash
node scripts/inspect-redis.js
```

## 📈 Métriques et monitoring

La nouvelle structure permet un monitoring facile :
- Nombre d'entités par collection via `SCARD index:<collection>`
- Taille mémoire par collection via `MEMORY USAGE <key>`
- Dernières activités via les timestamps des battles

## 🔄 Migration

**Important :** La migration assume que la base Redis actuelle est vide comme spécifié. 

Les données initiales sont chargées automatiquement au démarrage de l'application via les méthodes `onModuleInit()` de chaque service.

Si une migration depuis l'ancien format est nécessaire, utiliser le script `clean-redis.js` pour nettoyer l'ancienne structure avant le redémarrage.
