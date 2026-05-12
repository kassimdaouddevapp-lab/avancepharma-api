#!/bin/bash

# Script pour pousser AvancePharma vers GitHub
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub

echo "🚀 Configuration GitHub pour AvancePharma API"
echo ""

# Demander le nom d'utilisateur GitHub
read -p "Entrez votre nom d'utilisateur GitHub : " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Nom d'utilisateur requis"
    exit 1
fi

echo ""
echo "📝 Commandes à exécuter :"
echo "1. Créer un nouveau repository sur GitHub : https://github.com/new"
echo "   - Nom : avancepharma-api"
echo "   - Description : SaaS API pour gestion des avances médicaments - NestJS/TypeORM/PostgreSQL"
echo "   - Visibilité : Public (ou Private selon vos besoins)"
echo "   - NE PAS initialiser avec README, .gitignore, ou license"
echo ""

read -p "Appuyez sur Entrée quand le repository GitHub est créé..."

echo ""
echo "🔗 Configuration du remote GitHub..."
git remote add origin https://github.com/$GITHUB_USERNAME/avancepharma-api.git

echo ""
echo "📤 Renommage de la branche master en main..."
git branch -M main

echo ""
echo "🚀 Push vers GitHub..."
git push -u origin main

echo ""
echo "✅ Succès ! Votre API AvancePharma est maintenant sur GitHub :"
echo "🌐 https://github.com/$GITHUB_USERNAME/avancepharma-api"
echo ""
echo "📋 Prochaines étapes recommandées :"
echo "1. Activer GitHub Actions pour CI/CD"
echo "2. Configurer Supabase pour la base de données"
echo "3. Déployer sur Railway ou Render"