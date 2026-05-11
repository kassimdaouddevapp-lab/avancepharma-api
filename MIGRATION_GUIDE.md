# 📊 Guide de Migration vers Supabase

Ce guide explique comment migrer votre base de données AvancePharma vers Supabase.

## 🎯 Options de migration

### Option 1 : Migration automatique (Recommandée)

**Prérequis :**
- PostgreSQL client (`psql`, `pg_dump`) installé
- Docker tournant
- Compte Supabase créé

**Étapes :**

1. **Créer le fichier de configuration**
```bash
cp .supabase.env.example .supabase.env
```

2. **Éditer `.supabase.env` avec vos credentials Supabase**

Trouvez ces informations dans le dashboard Supabase :
- Aller à : https://app.supabase.com
- Sélectionner votre projet
- Cliquer sur "Settings" → "Database"
- Copier les informations de connexion

```env
SUPABASE_HOST=your-project-ref.supabase.co
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=votre-password-super-securisée
```

3. **Lancer la migration**
```bash
./migrate-to-supabase.sh
```

Le script va :
- ✅ Vérifier la connexion Supabase
- ✅ Exporter la base locale
- ✅ Importer les données dans Supabase
- ✅ Nettoyer les fichiers temporaires

---

### Option 2 : Migration manuelle

Si le script échoue ou ne marche pas, voici comment faire manuellement :

#### Étape 1 : Exporter la base locale

```bash
# Exporter depuis le conteneur Docker
docker exec avancepharma_postgres pg_dump \
  -U postgres \
  -d avancepharma \
  --no-owner \
  --no-privileges \
  > dump.sql
```

#### Étape 2 : Importer dans Supabase

```bash
# Via le client psql
psql \
  -h your-project-ref.supabase.co \
  -U postgres \
  -d postgres \
  -f dump.sql
```

#### Étape 3 : Vérifier

```bash
# Vérifier les tables
psql \
  -h your-project-ref.supabase.co \
  -U postgres \
  -d postgres \
  -c "\dt"
```

---

### Option 3 : Via l'interface Supabase

1. **Aller sur Supabase Dashboard**
2. **Cliquer sur "SQL Editor"**
3. **Créer les tables manuellement** (voir schema ci-dessous)
4. **Insérer les données** (si nécessaire)

---

## 🔧 Schéma de base de données

Si vous devez créer manuellement les tables :

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pharmacies
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents pharmacie
CREATE TABLE pharmacy_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employeurs
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE,
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employés
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id),
  user_id UUID REFERENCES users(id),
  job_title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plafonds employés
CREATE TABLE employee_caps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  monthly_cap DECIMAL(10, 2),
  used_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  pharmacy_id UUID REFERENCES pharmacies(id),
  pharmacy_agent_id UUID REFERENCES pharmacy_agents(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚨 Dépannage

### Erreur : "pg_dump not found"
```bash
# Installer PostgreSQL client
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Télécharger depuis : https://www.postgresql.org/download/
```

### Erreur : "Cannot connect to Supabase"
- Vérifier que les credentials sont corrects
- Vérifier que vous êtes depuis une adresse IP autorisée
- Vérifier que la base de données est en bon état

### Erreur : "Docker container not found"
```bash
# Relancer Docker Compose
docker compose down
docker compose up -d
```

### Erreur : "Permission denied" sur le script
```bash
chmod +x migrate-to-supabase.sh
```

---

## ✅ Vérification de la migration

Une fois la migration terminée :

```bash
# Vérifier les tables
psql -h your-host -U postgres -d postgres -c "\dt"

# Vérifier le nombre de lignes
psql -h your-host -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"
```

---

## 🎯 Prochaines étapes

1. **Mettre à jour Railway** avec les nouveaux credentials Supabase
2. **Tester l'API** contre la base Supabase
3. **Configurer Upstash Redis** pour la production
4. **Déployer en production**