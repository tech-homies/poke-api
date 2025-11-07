# Collection Bruno - Pokemon API

Cette collection Bruno contient tous les tests pour l'API Pokemon.

## Structure

- **Battles/** : Tests pour les combats entre dresseurs
- **Pokemon Types/** : Tests pour les types de pokémons
- **Pokemons/** : Tests pour les pokémons
- **Teams/** : Tests pour les équipes de dresseurs
- **Trainers/** : Tests pour les dresseurs
- **environments/** : Configuration des environnements (Local, Production)

## Utilisation

### Avec l'interface Bruno

1. Ouvrir Bruno
2. Ouvrir la collection (dossier `bruno-collection`)
3. Sélectionner l'environnement "Local"
4. Exécuter les requêtes individuellement ou en batch

### En ligne de commande

```bash
# Exécuter tous les tests
npm run test:api

# Exécuter les tests d'un dossier spécifique
npm run test:api:battles
npm run test:api:pokemons
npm run test:api:types
npm run test:api:trainers
npm run test:api:teams

# Exécuter un fichier de test spécifique
bru run bruno-collection/Pokemons/Get\ All\ Pokemons.bru --env Local
```

## Environnements

- **Local** : http://localhost:3000 (développement)
- **Production** : https://api.pokemon.production (production)

## Bonnes pratiques appliquées

✅ **Organisation claire** : Tests regroupés par domaine fonctionnel

✅ **Nommage explicite** : Chaque fichier décrit clairement son objectif

✅ **Tests automatisés** : Assertions sur les status codes et la structure des réponses

✅ **Documentation** : Chaque requête inclut une documentation dans le bloc `docs`

✅ **Cas d'erreur** : Tests des cas nominaux ET des cas d'erreur (404, 400, etc.)

✅ **Variables d'environnement** : URL de base configurable par environnement

✅ **Séquençage** : Ordre d'exécution défini avec l'attribut `seq`

## Tests de validation

Chaque fichier inclut :
- Validation du code de statut HTTP
- Validation de la structure de la réponse
- Validation des données métier (ID, noms, etc.)
- Tests des cas d'erreur appropriés

## Prérequis

Avant d'exécuter les tests, assurez-vous que :
1. L'API est démarrée (`npm run start:dev`)
2. L'environnement Local est configuré dans Bruno
3. Bruno CLI est installé (`@usebruno/cli`)

