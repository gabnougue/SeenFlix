# Projet SeenFlix

Application web de recherche de films et séries, intégrant une gestion de favoris et d'avis personnels.

## Participants

Projet réalisé dans le cadre de la 2ème année filière Réseaux et Informatique à l'ENSEIRB-MATMECA.

- **Benjamin Manem** : Base de Données & Favoris
- **Roxane Fuatoga** : Authentification & Sécurité
- **Gabin Nougué** : Architecte Backend / Chef de projet

---

## Démarrage Rapide (Docker)

Le projet est entièrement conteneurisé pour faciliter son déploiement.

### Pré-requis

- Docker & Docker Compose installés sur la machine.
- Une clé API TMDB (The Movie Database).

### Lancement

1.  Assurez-vous d'avoir un fichier `.env` à la racine du projet (copié depuis `.env.example` et rempli) contenant votre `TMDB_API_KEY`.

2.  Lancez le script de déploiement (il vérifiera si Docker est installé) :

    ```bash
    ./deploy.sh
    ```

3.  L'application sera accessible à l'adresse : **http://localhost:8080**

### Développement

#### Option A : Développement avec Docker (Recommandé)

Pour lancer l'application en mode développement (avec **Hot Reload**), utilisez l'argument `dev` :

```bash
./deploy.sh dev
```

- Les modifications dans le code (`backend` ou `frontend`) sont immédiatement prises en compte.
- Les logs s'affichent en direct dans le terminal.
- Appuyez sur `Ctrl+C` pour arrêter.
- L'application sera accessible sur **http://localhost:8081**

#### Option B : Développement Local (Sans Docker)

Si vous préférez utiliser vos outils locaux (Node.js requis) :

1.  **Backend** :

    ```bash
    cd backend
    npm install
    npm run dev
    ```

    (Le serveur tourne sur `http://localhost:3000`)

2.  **Frontend** (dans un autre terminal) :
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    (L'application sera accessible sur `http://localhost:5173`)

### Arrêt

Pour arrêter les conteneurs (mode production) :

```bash
docker-compose down
```

Pour arrêter et **tout nettoyer** (supprimer les volumes de base de données, etc.) :

```bash
./deploy.sh clean
```

---
## For testing frontend

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

---

## Fonctionnalités

- **Authentification** : Création de compte et connexion sécurisée.
- **Recherche** : Exploration du catalogue TMDB (Films & Séries).
- **Favoris** : Ajout de contenus en favoris.
- **Avis** : Notation et commentaires sur les films.
- **Profil** : Gestion des informations personnelles.
