# 🚀 Comment lancer le projet

## Prérequis

- Node.js (version 18+)
- Redis (local ou distant via Vercel)
- Un fichier `.env.local` configuré

## Configuration

### 1. Créer le fichier `.env.local`

Copiez le fichier `.env.example` et créez un `.env.local` :

```bash
cp .env.example .env.local
```

### 2. Configurer Redis

Ajoutez l'URL de connexion Redis dans `.env.local` :

```env
# Utilisez l'une de ces deux variables
REDIS_URL=redis://localhost:6379
# OU
STORAGE_REDIS_URL=redis://default:password@host:port
```

Pour un Redis local avec Docker :
```bash
docker run -d -p 6379:6379 redis:alpine
```

## Lancement de l'application

### Mode développement (avec rechargement automatique)

```bash
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
✅ Redis connecté avec succès
✅ Données des Pokémons chargées dans Redis
✅ Données des dresseurs chargées dans Redis
✅ Données des équipes chargées dans Redis
✅ Données des combats initialisées dans Redis
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

### Redis ne se connecte pas

Vérifiez que :
1. Redis est bien démarré
2. L'URL dans `.env.local` est correcte
3. Le firewall autorise la connexion

### Les données ne se chargent pas

Supprimez les clés Redis et redémarrez :
```bash
redis-cli FLUSHALL
npm run start:dev
```

## Déploiement sur Vercel

Le projet est configuré pour fonctionner avec Vercel et Redis :

1. Ajoutez Redis à votre projet Vercel (Storage → Redis)
2. La variable `STORAGE_REDIS_URL` sera automatiquement injectée
3. Déployez avec `vercel deploy`

## Plus d'informations

- [Documentation Redis](./REDIS_INTEGRATION.md)
- [Tests API avec Bruno](./bruno-collection/README.md)

