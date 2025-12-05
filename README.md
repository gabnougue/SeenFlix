# Projet SeenFlix

Application web de recherche de films et séries, intégrant une gestion de favoris et d'avis personnels.

## Participants

Projet réalisé dans le cadre de la 2ème année filière Réseaux et Informatique à l'ENSEIRB-MATMECA.

- **Benjamin Manem** : Base de Données & Favoris
- **Roxane Fuatoga** : Authentification & Sécurité
- **Gabin Nougué** : Architecte Backend / Chef de projet

---

## Démarrage Rapide

> :warning: **Docker & Docker Compose**: Malheureusement un soucis est survenu avec le déploiement de la base de données et son utilisation via Docker. Nous avons donc décidé de ne pas l'utiliser sur cette architecture. Il faudra suivre la procédure pour lancer manuellement l'application dans les différents répertoires (Backend & Frontend).

### Pré-requis

- **Node.js** (v20 ou supérieur)
- **npm** (inclus avec Node.js)
- Une clé API TMDB (The Movie Database)

### Installation rapide (recommandé)

Exécutez le script d'initialisation :

```bash
chmod +x setup.sh
./setup.sh
```

Ce script :

- Génère automatiquement les secrets JWT
- Vous demande votre clé TMDB API
- Installe toutes les dépendances
- Initialise la base de données

### Installation manuelle

Si vous préférez configurer manuellement :

```bash
# Copier les fichiers .env.example
cp backend/.env.example backend/.env
# Modifier backend/.env et ajouter votre clé TMDB
# Obtenir une clé sur: https://www.themoviedb.org/settings/api
```

### Lancement

Ouvrez **deux terminaux** :

**Terminal 1 - Backend :**

```bash
cd backend
npm install
npx prisma migrate dev   # Initialise la base de données SQLite
npm run dev
```

Le serveur API tourne sur **http://localhost:3000**

**Terminal 2 - Frontend :**

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## Développement

### Structure du projet

```
SeenFlix/
├── backend/          # API Express.js + Prisma (SQLite)
│   ├── src/          # Code source
│   ├── prisma/       # Schéma et migrations
│   └── package.json
├── frontend/         # Application Vue.js 3
│   ├── src/          # Composants et vues
│   └── package.json
└── README.md
```

### Scripts utiles

**Backend :**

```bash
npm run dev          # Lancer en mode développement (hot reload)
npm run start        # Lancer en mode production
npm run db:studio    # Ouvrir Prisma Studio (interface BDD)
npm run db:reset     # Réinitialiser la base de données
npm run test         # Lancer les tests
```

**Frontend :**

```bash
npm run dev          # Lancer en mode développement
npm run build        # Compiler pour la production
npm run lint         # Vérifier le code avec ESLint
```

---

## Fonctionnalités

- **Authentification** : Création de compte et connexion sécurisée (JWT)
- **Recherche** : Exploration du catalogue TMDB (Films & Séries)
- **Favoris** : Ajout de contenus en favoris
- **Avis** : Notation et commentaires sur les films
- **Profil** : Gestion des informations personnelles

---

## API Documentation

Une fois le backend lancé, la documentation Swagger est disponible sur :

**http://localhost:3000/api-docs**

## Architecture et Stack Technique

Le projet suit une architecture **Client-Serveur** classique (REST API).

### Backend (API)

Le backend est construit autour de l'écosystème **Node.js**.

- **Serveur :** Express.js.
- **Base de données :** SQLite, gérée via l'ORM **Prisma**.
- **Authentification :** JWT (JSON Web Tokens) avec une stratégie Access Token (court) + Refresh Token (long). Mots de passe hashés avec `bcrypt`.
- **Validation :** Utilisation de la librairie **Zod** pour valider les entrées (body, query params).
- **Documentation :** Swagger (OpenAPI 3.0) généré via `swagger-jsdoc` et exposé sur `/api-docs`.
- **Intégration Externe :** L'API agit comme un **proxy** vers TMDB. Elle ne stocke pas les films, mais les récupère à la volée et les met en cache.

### Frontend (Client)

Le frontend est une Single Page Application (SPA) développée avec **Vue.js**.

- **Build Tool :** Vite (rapide et moderne).
- **Routing :** Vue Router (déduit de la structure).
- **State Management :** Pinia (déduit de `useUserStore` dans `axios.js`).
- **Appels HTTP :** Axios, configuré avec des intercepteurs pour gérer l'injection automatique du token JWT et le rafraîchissement transparent (refresh token).

## Analyse du Backend

### Modèle de Données (Prisma)

La base de données SQLite contient deux entités principales définies dans `schema.prisma` :

1.  **User** :

    - Stocke les informations de compte (`email`, `passwordHash`).
    - Relation `1-N` vers `Favorite`.

2.  **Favorite** :
    - Lie un utilisateur à un contenu TMDB (`tmdbId`, `type`).
    - Stocke les données "sociales" : `rating` (note), `comment` (avis).
    - Contrainte d'unicité sur `[userId, tmdbId, type]` pour éviter les doublons.

---

## Les Flux (Routes Clés)

Voici comment fonctionnent certaines routes clés, de la requête frontend jusqu'à la réponse.

### Authentification : `POST /auth/login`

Cette route permet à un utilisateur de se connecter.

1.  **Validation :** Le middleware valide que `email` et `password` sont présents et au bon format via Zod.
2.  **Vérification :** Le service vérifie si l'utilisateur existe et compare le hash du mot de passe.
3.  **Génération de Tokens :** Si OK, deux tokens sont générés :
    - `accessToken` : Durée de vie courte, utilisé pour authentifier les requêtes.
    - `refreshToken` : Durée de vie longue, utilisé pour obtenir un nouvel `accessToken` quand il expire.
4.  **Réponse :** Renvoie les tokens et les infos utilisateur au frontend.

### Recherche de Films : `GET /movies/search`

Cette route illustre le pattern "Backend-for-Frontend" (BFF) ou Proxy.

1.  **Frontend :** Envoie une requête `GET /movies/search?q=Avatar`.
2.  **Backend (Cache Check) :** Vérifie si "avatar" est dans le cache mémoire.
3.  **Backend (TMDB Call) :** Si pas en cache, le backend fait une requête HTTP vers `api.themoviedb.org/3/search/multi` avec sa propre clé API (`TMDB_API_KEY`).
    - _Note : Cela permet de ne jamais exposer la clé API TMDB au client (navigateur)._
4.  **Transformation :** Le backend reçoit la réponse de TMDB, ne garde que les champs utiles (titre, poster, date...) et normalise les données.
5.  **Mise en Cache :** Le résultat est stocké en mémoire pour les prochaines minutes.
6.  **Réponse :** Le JSON épuré est renvoyé au frontend.

### Détail d'un Film + Avis : `GET /movies/:type/:id`

Cette route est une route d'**agrégation**. Elle combine des données externes (TMDB) et internes (Base de données).

1.  **Parallélisation :** Le backend lance deux opérations en parallèle (`Promise.all`) :
    - Appel TMDB pour avoir les infos du film (synopsis, casting...).
    - Requête Prisma (`db.favorite.findMany`) pour récupérer les avis des utilisateurs SeenFlix sur ce film.
2.  **Calculs :** Une fois les deux réponses reçues, le backend calcule la "Note Moyenne SeenFlix" à partir des avis locaux.
3.  **Fusion :** Il construit un objet réponse unique contenant les infos du film ET les avis/notes SeenFlix.
4.  **Avantage :** Le frontend n'a besoin de faire qu'une seule requête pour afficher toute la page "Détails".
