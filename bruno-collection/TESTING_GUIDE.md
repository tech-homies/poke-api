# Guide de test avec Bruno

## Installation et prérequis

Bruno CLI est déjà installé dans le projet via `@usebruno/cli`.

```bash
# Vérifier l'installation
npx bru --version
```

## Lancement de l'API

Avant d'exécuter les tests, l'API doit être en cours d'exécution :

```bash
npm run start:dev
```

L'API sera accessible sur `http://localhost:3000`

## Exécution des tests

### Tous les tests de la collection

```bash
npm run test:e2e
```

Cette commande exécute tous les tests de la collection Bruno et génère un fichier `results.json` avec les résultats.

### Tests par module

```bash
# Tests des combats
bru run "bruno-collection/Battles" --env Local

# Tests des pokémons
bru run "bruno-collection/Pokemons" --env Local

# Tests des types de pokémons
bru run "bruno-collection/Pokemon Types" --env Local

# Tests des dresseurs
bru run "bruno-collection/Trainers" --env Local

# Tests des équipes
bru run "bruno-collection/Teams" --env Local
```

### Exécution d'une requête spécifique

```bash
# Syntaxe générale
bru run "bruno-collection/[Dossier]/[Fichier].bru" --env Local

# Exemple
bru run "bruno-collection/Pokemons/Get All Pokemons.bru" --env Local
```

## Environnements

### Local (par défaut)
- URL : `http://localhost:3000`
- Usage : Développement et tests locaux

### Production
- URL : `https://api.pokemon.production`
- Usage : Tests en production

Pour changer d'environnement :

```bash
bru run bruno-collection --env Production
```

## Intégration CI/CD

Exemple de workflow pour GitHub Actions :

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run start:dev &
      - run: sleep 5 # Attendre que l'API démarre
      - run: npm run test:e2e
```

## Structure des tests

Chaque fichier `.bru` contient :

1. **meta** : Métadonnées (nom, type, séquence)
2. **get/post/put/delete** : Configuration de la requête
3. **body** : Corps de la requête (si applicable)
4. **docs** : Documentation de la requête
5. **tests** : Assertions automatiques

### Exemple de structure

```javascript
meta {
  name: Get All Pokemons
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/pokemons
  body: none
  auth: none
}

docs {
  Description de la requête et de son comportement attendu
}

tests {
  test("Status code is 200", function() {
    expect(res.getStatus()).to.equal(200);
  });
}
```

## Bonnes pratiques

### ✅ Organisation
- Un fichier par cas de test
- Regroupement par module fonctionnel
- Nommage explicite des fichiers

### ✅ Tests
- Tester les cas nominaux (200, 201, 204)
- Tester les cas d'erreur (400, 404)
- Valider la structure des réponses
- Valider les données métier

### ✅ Documentation
- Documenter chaque requête avec le bloc `docs`
- Expliquer les paramètres attendus
- Décrire les réponses possibles

### ✅ Maintenance
- Utiliser des variables d'environnement pour les URLs
- Éviter les données hardcodées sensibles
- Maintenir à jour le fichier README.md

## Debugging

### Voir les détails d'une requête

```bash
# Ajouter --verbose pour plus de détails
bru run bruno-collection/Pokemons/Get\ All\ Pokemons.bru --env Local --verbose
```

### Afficher les headers

Les headers sont automatiquement affichés avec l'option `--verbose`.

### Sauvegarder les résultats

```bash
# Les résultats sont automatiquement sauvegardés dans results.json
npm run test:e2e

# Consulter les résultats
cat results.json | jq '.'
```

## Résolution des problèmes courants

### L'API ne répond pas
- Vérifier que l'API est démarrée (`npm run start:dev`)
- Vérifier le port (par défaut 3000)
- Vérifier les logs de l'API

### Les tests échouent
- Vérifier l'environnement sélectionné
- Vérifier que les données de test existent
- Consulter les logs avec `--verbose`

### Variables non définies
- Vérifier que l'environnement est correctement configuré
- Vérifier que `{{baseUrl}}` est défini dans l'environnement

## Commandes utiles

```bash
# Lister toutes les requêtes
find bruno-collection -name "*.bru" -type f

# Compter les requêtes par dossier
find bruno-collection -name "*.bru" -type f | grep -o "bruno-collection/[^/]*" | sort | uniq -c

# Exécuter les tests et afficher un résumé
npm run test:e2e && echo "✅ Tests terminés"
```

