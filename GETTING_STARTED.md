# 🚀 Comment lancer le projet

## Prérequis

- Node.js (version 18+)

> ℹ️ Aucune base de données externe n'est nécessaire.
>
> - `npm run start:dev` / `start:debug` utilisent une **base en mémoire**,
>   réinitialisée à chaque démarrage.
> - `npm run start` / `start:prod` persistent les données dans un **fichier
>   plat** (`data/db.json`, via [lowdb](https://github.com/typicode/lowdb)) :
>   elles survivent aux redémarrages.
>
> Dans tous les cas, les données initiales (Pokémons, dresseurs, équipes,
> combats) sont chargées automatiquement à partir du repo au tout premier
> démarrage (voir [Réinitialiser les données](#réinitialiser-les-données)).

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
| `npm run db:reset` | Supprime le fichier `data/db.json` (les données d'origine du repo sont rechargées au prochain `npm start`/`start:prod`) |
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

- En **mode développement** (`start:dev`/`start:debug`) : les données vivent
  uniquement en mémoire, il suffit de **redémarrer l'application** pour
  repartir des données initiales.
- En **mode persistant** (`start`/`start:prod`) : les données survivent aux
  redémarrages. Pour repartir des données d'origine du repo, supprimer le
  fichier de base de données puis relancer l'application :

  ```bash
  npm run db:reset
  npm start
  ```

## Plus d'informations

- [Tests API avec Bruno](./bruno-collection/README.md)
