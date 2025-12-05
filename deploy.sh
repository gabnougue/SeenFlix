#!/bin/bash

# Fonction pour vérifier et installer Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Docker n'est pas installé."
        
        # Détection de l'OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "macOS détecté."
            if command -v brew &> /dev/null; then
                echo "Homebrew détecté. Installation de Docker..."
                brew install --cask docker
                echo "Veuillez lancer Docker Desktop depuis vos Applications et attendre qu'il soit prêt."
                read -p "Appuyez sur Entrée une fois Docker lancé..."
            else
                echo "Homebrew n'est pas installé. Veuillez installer Docker Desktop manuellement : https://www.docker.com/products/docker-desktop"
                exit 1
            fi
        elif [[ -f /etc/debian_version ]]; then
            echo "Debian/Ubuntu détecté."
            echo "Installation de Docker..."
            sudo apt-get update
            sudo apt-get install -y docker.io docker-compose
            sudo systemctl start docker
            sudo usermod -aG docker $USER
            echo "Vous devrez peut-être vous déconnecter/reconnecter pour utiliser Docker sans sudo."
        else
            echo "OS non supporté pour l'installation automatique. Veuillez installer Docker manuellement."
            exit 1
        fi
    else
        echo "Docker est installé."
    fi

    # Vérification que le démon Docker tourne
    if ! docker info &> /dev/null; then
        echo "Le démon Docker ne semble pas tourner. Veuillez le lancer."
        exit 1
    fi
}

# Fonction pour nettoyer l'environnement
clean() {
    echo "Nettoyage de l'environnement Docker..."
    docker-compose down --volumes --remove-orphans
    echo "Environnement nettoyé (conteneurs, réseaux et volumes supprimés)."
    exit 0
}

# Analyse des arguments
MODE="prod"
for arg in "$@"; do
    if [ "$arg" == "dev" ]; then
        MODE="dev"
    elif [ "$arg" == "clean" ]; then
        clean
    fi
done

# Vérification de Docker au démarrage
check_docker

# Vérification de la présence du fichier .env
if [ ! -f ".env" ]; then
    echo "Erreur : Fichier .env introuvable à la racine."
    echo "Veuillez créer un fichier .env à partir de .env.example et remplir les champs (notamment TMDB_API_KEY)."
    echo "Commande suggérée : cp .env.example .env"
    exit 1
fi

echo "Chargement des variables d'environnement..."
source .env

if [ "$MODE" == "dev" ]; then
    echo "Démarrage de SeenFlix en mode DÉVELOPPEMENT (Hot Reload)..."
    echo "Les modifications dans le code seront automatiquement prises en compte."
    echo "Appuyez sur Ctrl+C pour arrêter."
    echo "Frontend accessible sur : http://localhost:8081"
    
    # Lancement avec configuration dev autonome
    docker-compose -f docker-compose.dev.yml up --build
else
    echo "Démarrage de SeenFlix en mode PRODUCTION (Docker)..."
    
    # Build et lancement des conteneurs
    docker-compose up --build -d

    # Vérifier si la commande précédente a réussi
    if [ $? -ne 0 ]; then
        echo "Erreur : Le démarrage de l'application a échoué."
        exit 1
    fi

    echo ""
    echo "Application démarrée !"
    echo "Frontend accessible sur : http://localhost:8080"
    echo "Backend accessible via le proxy interne"
    echo ""
    echo "Pour arrêter l'application : docker-compose down"
    echo "Pour tout nettoyer (volumes inclus) : ./deploy.sh clean"
fi
