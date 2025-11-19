#!/bin/bash

echo "=== Installation des dépendances ==="
npm install

echo ""
echo "=== Configuration de l'environnement ==="
if [ ! -f .env ]; then
  echo "Création du fichier .env depuis .env.example"
  cp .env.example .env
else
  echo "Fichier .env déjà existant"
fi

# Mettre un temps d'arrêt ou une proposition pour rentrer la clé TMDB si besoin

echo ""
echo "=== Génération du client Prisma ==="
npx prisma generate

echo ""
echo "=== Création de la base de données et application des migrations ==="
npx prisma migrate dev --name init

echo ""
echo "=== Seed de la base de données ==="
npm run db:seed

echo ""
echo "=== Base de données initialisée avec succès ! ==="
echo "Utilisateur de démo créé : alice@example.org / Passw0rd!"