FROM node:20-alpine

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma (si besoin)
RUN apk add --no-cache openssl

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Exposition du port
EXPOSE 3000

# Script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
