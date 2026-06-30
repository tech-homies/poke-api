# 🚀 Comment lancer le projet

## Prérequis

- Node.js (version 18+)

> ℹ️ Aucune base de données externe n'est nécessaire. Les données sont stockées
> dans une **base en mémoire** qui est **réinitialisée à chaque démarrage** de
> l'application. Les données initiales (Pokémons, dresseurs, équipes, combats)
> sont rechargées automatiquement au démarrage.

## Configuration

Le projet fonctionne sans configuration. Vous pouvez éventuellement créer un
fichier `.env.local` pour personnaliser le port :

```bash
cp .env.example .env.local
```

```env
# Port de l'application (par défaut : 3000)
PORT=3000
```

## Lancement de l'application

### Mode développement (avec rechargement automatique)

```bash
npm install
npm run start:dev
```

### Mode production

```bash
npm run build
npm run start:prod
```

### Mode debug

```bash
npm run start:debug
```

## Vérification du fonctionnement

Lorsque l'application démarre, vous devriez voir dans les logs :

```
✅ Données des Pokémons chargées en mémoire
✅ Données des dresseurs chargées en mémoire
✅ Données des équipes chargées en mémoire
✅ Données des combats chargées en mémoire
[Nest] XXX - XX/XX/XXXX     LOG [NestApplication] Nest application successfully started
```

## Accès à l'application

- **API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run start` | Démarre l'application |
| `npm run start:dev` | Démarre en mode développement avec rechargement automatique |
| `npm run start:debug` | Démarre en mode debug |
| `npm run start:prod` | Démarre en mode production |
| `npm run build` | Compile le projet |
| `npm run lint` | Vérifie et corrige le code |
| `npm run format` | Formate le code |
| `npm run test` | Lance les tests unitaires |
| `npm run test:e2e` | Lance les tests end-to-end avec Bruno |

## Dépannage

### Le port 3000 est déjà utilisé

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Réinitialiser les données

Les données vivent uniquement en mémoire : il suffit de **redémarrer
l'application** pour repartir des données initiales.

```bash
npm run start:dev
```

## Plus d'informations

- [Tests API avec Bruno](./bruno-collection/README.md)
