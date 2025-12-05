#!/bin/sh

# Attendre que la base de données soit prête (si on utilisait une vraie DB externe, ici c'est SQLite donc fichier local)
echo "Starting Backend..."

# Exécuter les migrations pour s'assurer que la DB est à jour
echo "Running database migrations..."
npx prisma migrate deploy

# Si la base est vide ou nouvelle, on peut vouloir seeder
# echo "Seeding database..."
# npm run db:seed

# Lancer la commande passée en argument (npm start)
exec "$@"
