#!/bin/bash

# Script de migration vers Supabase (non-interactif)
# Utilisation : 
#   Option 1 : Charger depuis .supabase.env
#     cp .supabase.env.example .supabase.env
#     [Éditer .supabase.env avec vos credentials]
#     ./migrate-to-supabase.sh
#
#   Option 2 : Variables d'environnement
#     export SUPABASE_HOST="..."
#     export SUPABASE_USER="..."
#     ./migrate-to-supabase.sh

set -e

echo "🚀 Migration AvancePharma vers Supabase"
echo ""

# Charger les variables depuis .supabase.env si le fichier existe
if [ -f .supabase.env ]; then
    echo "📄 Chargement depuis .supabase.env..."
    set -a
    source .supabase.env
    set +a
    echo "✅ Variables chargées"
fi

# Vérifier si les variables sont définies
if [ -z "$SUPABASE_HOST" ]; then
    echo "❌ SUPABASE_HOST non défini"
    echo "Options :"
    echo "  1. Créer .supabase.env : cp .supabase.env.example .supabase.env"
    echo "  2. Éditer le fichier avec vos credentials Supabase"
    echo "  3. Relancer le script"
    exit 1
fi

if [ -z "$SUPABASE_USER" ]; then
    echo "❌ SUPABASE_USER non défini"
    exit 1
fi

if [ -z "$SUPABASE_PASSWORD" ]; then
    echo "❌ SUPABASE_PASSWORD non défini"
    exit 1
fi

# Valeurs par défaut
SUPABASE_PORT=${SUPABASE_PORT:-5432}
SUPABASE_DB=${SUPABASE_DB:-postgres}

# Local PostgreSQL container credentials
LOCAL_DB_USER=${LOCAL_DB_USER:-avancepharma_user}
LOCAL_DB_PASSWORD=${LOCAL_DB_PASSWORD:-avancepharma_pass}
LOCAL_DB_NAME=${LOCAL_DB_NAME:-avancepharma}

# Vérifier si les outils sont installés
command -v pg_dump >/dev/null 2>&1 || { echo "❌ pg_dump n'est pas installé. Installez PostgreSQL client."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ psql n'est pas installé. Installez PostgreSQL client."; exit 1; }

echo ""
echo "📋 Configuration Supabase :"
echo "  Host      : $SUPABASE_HOST"
echo "  Port      : $SUPABASE_PORT"
echo "  Database  : $SUPABASE_DB"
echo "  User      : $SUPABASE_USER"
echo ""

echo ""
echo "🔍 Vérification de la connexion à Supabase..."
PGPASSWORD=$SUPABASE_PASSWORD psql \
  -h $SUPABASE_HOST \
  -p $SUPABASE_PORT \
  -U $SUPABASE_USER \
  -d $SUPABASE_DB \
  -c "SELECT version();" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Connexion Supabase réussie"
else
    echo "❌ Échec de connexion à Supabase. Vérifiez vos credentials."
    exit 1
fi

echo "📤 Export de la base locale..."
LOCAL_DUMP_FILE="avancepharma_local_dump.sql"

# Démarrer les conteneurs si nécessaire
docker compose up -d postgres >/dev/null 2>&1

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL local..."
sleep 5

# Trouver le bon nom du conteneur postgres
POSTGRES_CONTAINER=$(docker compose ps -q postgres 2>/dev/null || echo "avancepharma_postgres")

# Export de la base locale
echo "📦 Export depuis le conteneur Docker : $POSTGRES_CONTAINER"
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" $POSTGRES_CONTAINER pg_dump \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  > $LOCAL_DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Export local réussi : $LOCAL_DUMP_FILE"
else
    echo "❌ Échec de l'export local"
    exit 1
fi

echo ""
echo "📥 Import vers Supabase..."
PGPASSWORD=$SUPABASE_PASSWORD psql \
  -h $SUPABASE_HOST \
  -p $SUPABASE_PORT \
  -U $SUPABASE_USER \
  -d $SUPABASE_DB \
  < $LOCAL_DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Migration vers Supabase réussie !"
    echo ""
    echo "🧹 Nettoyage..."
    rm $LOCAL_DUMP_FILE
    echo "✅ Fichier dump supprimé"
    echo ""
    echo "🎉 Migration terminée !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Mettre à jour les variables d'environnement dans Railway"
    echo "2. Tester l'API en production"
    echo "3. Configurer le domaine personnalisé si nécessaire"
else
    echo "❌ Échec de l'import vers Supabase"
    echo "📄 Le fichier dump est sauvegardé : $LOCAL_DUMP_FILE"
    exit 1
fi