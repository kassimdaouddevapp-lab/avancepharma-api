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

### Production

1. **Base de données** : Supabase PostgreSQL
2. **Backend** : Railway, Render, ou Vercel
3. **Cache** : Redis Cloud ou Upstash
4. **CI/CD** : GitHub Actions

### Configuration production

```env
NODE_ENV=production
DB_HOST=votre-host-supabase
DB_URL=votre-connection-string-supabase
REDIS_URL=votre-redis-url
```

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