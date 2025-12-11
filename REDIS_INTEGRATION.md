# Intégration Redis

## Vue d'ensemble

Le projet utilise maintenant Redis pour stocker les données au lieu de variables en mémoire. Les données sont chargées automatiquement dans Redis au démarrage de l'application.

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec l'une des variables suivantes :

```env
REDIS_URL=redis://[username]:[password]@[host]:[port]
```

ou

```env
STORAGE_REDIS_URL=redis://[username]:[password]@[host]:[port]
```

Exemple pour un Redis local :
```env
REDIS_URL=redis://localhost:6379
```

### Fonctionnement

1. **Au démarrage de l'application** :
   - Le service Redis se connecte à la base de données Redis
   - Chaque service (Trainers, Pokemons, Teams, Battles) charge ses données initiales dans Redis
   - Les données sont stockées avec des clés spécifiques : `trainers`, `pokemons`, `teams`, `battles`

2. **Pendant l'exécution** :
   - Toutes les lectures et écritures passent par Redis
   - Les données sont persistées dans Redis et survivent aux redémarrages
   - Si Redis n'est pas disponible, l'application log un avertissement mais continue de fonctionner

## Structure

### Nouveaux fichiers

- `src/redis/redis.module.ts` : Module Redis global
- `src/redis/redis.service.ts` : Service Redis avec méthodes CRUD

### Fichiers modifiés

- `src/app.module.ts` : Ajout du RedisModule
- `src/trainers/trainers.service.ts` : Utilisation de Redis au lieu de variables en mémoire
- `src/pokemons/pokemons.service.ts` : Utilisation de Redis au lieu de variables en mémoire
- `src/teams/teams.service.ts` : Utilisation de Redis au lieu de variables en mémoire
- `src/battles/battles.service.ts` : Utilisation de Redis au lieu de variables en mémoire
- Tous les contrôleurs : Ajout de `async/await` pour gérer les Promises

## Clés Redis utilisées

- `trainers` : Liste de tous les dresseurs
- `pokemons` : Liste de tous les Pokémons
- `teams` : Objet avec les équipes par ID de dresseur
- `battles` : Liste de tous les combats

## Avantages

✅ **Persistance des données** : Les données survivent aux redémarrages de l'application
✅ **Scalabilité** : Facile d'ajouter plusieurs instances de l'application
✅ **Performance** : Redis est très rapide pour les lectures/écritures
✅ **Production-ready** : Parfait pour un déploiement sur Vercel avec Redis

## Tests

Pour tester en local avec Redis :

```bash
# Démarrer Redis avec Docker
docker run -d -p 6379:6379 redis:alpine

# Définir la variable d'environnement
export REDIS_URL=redis://localhost:6379

# Démarrer l'application
npm run start:dev
```

Vous devriez voir dans les logs :
```
✅ Redis connecté avec succès
✅ Données des dresseurs chargées dans Redis
✅ Données des Pokémons chargées dans Redis
✅ Données des équipes chargées dans Redis
✅ Données des batailles initialisées dans Redis
```

