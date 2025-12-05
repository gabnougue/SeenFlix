#!/bin/bash

# =================================================
# SeenFlix - Script d'initialisation
# =================================================
# Ce script configure l'environnement de développement

set -e

echo "╔════════════════════════════════════════════╗"
echo "║     SeenFlix - Configuration initiale      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour générer un secret aléatoire
generate_secret() {
    openssl rand -base64 32 2>/dev/null || cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

# ===================================
# 1. Configuration du Backend
# ===================================
echo -e "${YELLOW}[1/3]${NC} Configuration du backend..."

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Fichier backend/.env existe déjà"
else
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Fichier backend/.env créé"
    
    # Générer des secrets JWT aléatoires
    ACCESS_SECRET=$(generate_secret)
    REFRESH_SECRET=$(generate_secret)
    
    # Remplacer les secrets dans le fichier .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CHANGE_ME_ACCESS_SECRET_RANDOM_STRING/$ACCESS_SECRET/" backend/.env
        sed -i '' "s/CHANGE_ME_REFRESH_SECRET_RANDOM_STRING/$REFRESH_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/CHANGE_ME_ACCESS_SECRET_RANDOM_STRING/$ACCESS_SECRET/" backend/.env
        sed -i "s/CHANGE_ME_REFRESH_SECRET_RANDOM_STRING/$REFRESH_SECRET/" backend/.env
    fi
    echo -e "${GREEN}✓${NC} Secrets JWT générés automatiquement"
fi

# ===================================
# 2. Demander la clé TMDB
# ===================================
echo ""
echo -e "${YELLOW}[2/3]${NC} Configuration de la clé TMDB API..."

# Vérifier si la clé TMDB est déjà configurée
CURRENT_KEY=$(grep "TMDB_API_KEY=" backend/.env | cut -d'=' -f2 | tr -d '"')

if [ "$CURRENT_KEY" = "YOUR_TMDB_API_KEY" ] || [ -z "$CURRENT_KEY" ]; then
    echo ""
    echo "Vous avez besoin d'une clé API TMDB."
    echo ""
    read -p "Entrez votre clé TMDB API (ou appuyez sur Entrée pour ignorer): " TMDB_KEY
    
    if [ -n "$TMDB_KEY" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/YOUR_TMDB_API_KEY/$TMDB_KEY/" backend/.env
        else
            sed -i "s/YOUR_TMDB_API_KEY/$TMDB_KEY/" backend/.env
        fi
        echo -e "${GREEN}✓${NC} Clé TMDB configurée"
    else
        echo -e "${YELLOW}⚠${NC} Clé TMDB non configurée - vous devrez la modifier dans backend/.env"
    fi
else
    echo -e "${GREEN}✓${NC} Clé TMDB déjà configurée"
fi



# ===================================
# 3. Installation des dépendances
# ===================================
echo ""
echo -e "${YELLOW}[3/3]${NC} Installation des dépendances..."

echo ""
echo "Installation des dépendances backend..."
cd backend
npm install
echo -e "${GREEN}✓${NC} Dépendances backend installées"

echo ""
echo "Génération du client Prisma et migration..."
npx prisma generate
npx prisma migrate dev --name init 2>/dev/null || npx prisma db push
echo -e "${GREEN}✓${NC} Base de données initialisée"

cd ..

echo ""
echo "Installation des dépendances frontend..."
cd frontend
npm install
echo -e "${GREEN}✓${NC} Dépendances frontend installées"

cd ..

# ===================================
# Résumé
# ===================================
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║           Configuration terminée !          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Pour lancer l'application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  • Frontend:  http://localhost:5173"
echo "  • Backend:   http://localhost:3000"
echo "  • API Docs:  http://localhost:3000/api-docs"
echo ""
