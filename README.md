# AvancePharma SaaS

Plateforme SaaS de gestion des avances médicaments pour entreprises et pharmacies.

## 🚀 Fonctionnalités

- **Gestion des utilisateurs** : Authentification JWT, rôles granulaire (Super Admin, RH, Pharmacien, Employé)
- **Gestion des pharmacies** : CRUD pharmacies avec agents
- **Gestion RH** : Employeurs, employés, plafonds mensuels
- **Transactions** : Demandes d'avances, validation, suivi
- **Audit complet** : Traçabilité de toutes les opérations
- **API RESTful** : Architecture moderne avec NestJS

## 🛠️ Stack Technique

- **Backend** : NestJS + TypeScript
- **Base de données** : PostgreSQL + TypeORM
- **Cache/Session** : Redis
- **Authentification** : JWT RS256
- **Architecture** : Monorepo (npm workspaces + Turborepo)
- **Conteneurisation** : Docker + Docker Compose

## 📦 Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Démarrage rapide

1. **Cloner le repository**
```bash
git clone <votre-repo-github>
cd avancepharma
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer l'infrastructure**
```bash
docker compose up -d
```

4. **Configurer l'environnement**
```bash
cp apps/api/.env.example apps/api/.env
# Éditer .env avec vos configurations
```

5. **Générer les clés JWT**
```bash
cd apps/api
npm run keys:generate
```

6. **Démarrer l'API**
```bash
npm run dev
```

7. **Exécuter les migrations**
```bash
npm run migration:run
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer en mode développement
npm run build            # Build production
npm run start            # Démarrer en production

# Base de données
npm run migration:run    # Exécuter les migrations
npm run migration:generate # Générer une migration
npm run migration:create # Créer une migration vide

# Utilitaires
npm run keys:generate    # Générer les clés JWT
npm run lint             # Linting
npm run test             # Tests
```

## 🏗️ Architecture

```
avancepharma/
├── apps/
│   └── api/              # Application NestJS
├── packages/
│   └── shared/           # Types et enums partagés
├── docker-compose.yml    # Infrastructure locale
└── turbo.json           # Configuration Turborepo
```

## 🔐 Variables d'environnement

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=avancepharma
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_PRIVATE_KEY_PATH=apps/api/keys/private.pem
JWT_PUBLIC_KEY_PATH=apps/api/keys/public.pem

# Application
PORT=3000
NODE_ENV=development
```

## 🚀 Déploiement

### 🚀 Déploiement Automatique (Recommandé)

#### 1. Configuration GitHub Actions
Les workflows CI/CD sont déjà configurés dans `.github/workflows/` :
- **CI** : Tests automatiques à chaque push
- **CD** : Déploiement automatique sur Railway

#### 2. Configuration Railway
```bash
# 1. Créer un compte sur https://railway.app
# 2. Connecter votre repo GitHub
# 3. Railway détectera automatiquement railway.json et Dockerfile
```

#### 3. Configuration Supabase
```bash
# 1. Créer un projet sur https://supabase.com
# 2. Récupérer les credentials de base de données
# 3. Ajouter les variables dans Railway :
   DB_HOST=your-supabase-host
   DB_USERNAME=postgres
   DB_PASSWORD=your-password
   DB_DATABASE=postgres
   DB_SSL=true
```

#### 4. Configuration Redis (Upstash)
```bash
# 1. Créer une base Redis sur https://upstash.com
# 2. Récupérer l'URL de connexion
# 3. Ajouter dans Railway :
   REDIS_URL=your-upstash-url
```

#### 5. Générer et déployer les clés JWT
```bash
# Générer les clés localement
npm run keys:generate

# Les copier dans Railway (via interface web)
# Ou utiliser Railway CLI pour les variables de fichiers
```

### 🐳 Déploiement Docker Manuel

#### Railway (Recommandé)
1. **Lier le repo GitHub** à Railway
2. **Railway détecte automatiquement** `railway.json` et `Dockerfile`
3. **Configurer les variables d'environnement** dans le dashboard Railway
4. **Déploiement automatique** à chaque push sur main

#### Render
```bash
# 1. Créer un service Web sur https://render.com
# 2. Connecter votre repo GitHub
# 3. Configuration :
   - Runtime : Docker
   - Dockerfile path : ./Dockerfile
   - Port : 8080
```

#### Vercel
```bash
# Pour API routes uniquement
vercel --prod
```

### 📊 Base de données

#### Migration depuis local vers Supabase
```bash
# 1. Créer un projet Supabase
# 2. Exécuter les migrations :
npm run migration:run
# 3. (Optionnel) Importer les données de test :
pg_dump local_db | psql supabase_db
```

### 🔧 Variables d'environnement Production

```env
# Application
NODE_ENV=production
PORT=8080
API_PREFIX=/api/v1

# Base de données Supabase
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Redis Upstash
REDIS_URL=rediss://your-upstash-url

# JWT (les chemins sont relatifs au conteneur)
JWT_PRIVATE_KEY_PATH=/app/keys/private.pem
JWT_PUBLIC_KEY_PATH=/app/keys/public.pem
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
```

### 📈 Monitoring & Analytics

- **Railway** : Dashboard intégré avec logs et métriques
- **Supabase** : Analytics SQL et monitoring base de données
- **Upstash** : Monitoring Redis et analytics

## 📊 API Endpoints

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir token
- `POST /auth/logout` - Déconnexion

### Utilisateurs
- `GET /users` - Liste utilisateurs
- `POST /users` - Créer utilisateur
- `PUT /users/change-password` - Changer mot de passe

### Pharmacies
- `GET /pharmacies` - Liste pharmacies
- `POST /pharmacies` - Créer pharmacie
- `POST /pharmacies/:id/agents` - Ajouter agent

### Employeurs
- `GET /employers` - Liste employeurs
- `POST /employers` - Créer employeur
- `POST /employers/:id/employees` - Ajouter employé

### Transactions
- `POST /transactions` - Créer transaction
- `PUT /transactions/:id/validate` - Valider transaction
- `GET /transactions/employee/:id/monthly-usage` - Usage mensuel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou support, ouvrez une issue sur GitHub.

---

**AvancePharma** - Simplifiez la gestion des avances médicaments ! 💊✨