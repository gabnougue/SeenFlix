import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import axios from 'axios';

const prisma = new PrismaClient();

export const favoritesService = {
  /**
   * Récupère tous les favoris d'un utilisateur
   */
  async getUserFavorites(userId) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Enrichir chaque favori avec les données TMDB
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.warn('TMDB_API_KEY manquante, retour des favoris sans enrichissement');
      return favorites;
    }

    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const response = await axios.get(
            `https://api.themoviedb.org/3/${fav.type}/${fav.tmdbId}`,
            {
              params: {
                api_key: apiKey,
                language: 'fr-FR'
              }
            }
          );

          return {
            ...fav,
            title: response.data.title || response.data.name,
            posterPath: response.data.poster_path,
            overview: response.data.overview,
            releaseDate: response.data.release_date || response.data.first_air_date
          };
        } catch (error) {
          console.error(`Erreur enrichissement TMDB pour favori ${fav.id}:`, error.message);
          // Retourner le favori sans enrichissement en cas d'erreur
          return {
            ...fav,
            title: 'Titre non disponible',
            posterPath: null,
            overview: 'Description non disponible',
            releaseDate: null
          };
        }
      })
    );

    return enrichedFavorites;
  },

  /**
   * Ajoute un favori pour un utilisateur
   */
  async addFavorite(userId, { tmdbId, type, rating, comment }) {
    try {
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          tmdbId,
          type,
          rating,
          comment
        }
      });
      return favorite;
    } catch (error) {
      // Gestion de l'erreur de contrainte unique
      if (error.code === 'P2002') {
        throw new AppError(
          'Ce contenu est déjà dans vos favoris',
          409,
          'DUPLICATE_FAVORITE'
        );
      }
      throw error;
    }
  },

  /**
   * Supprime un favori
   */
  async deleteFavorite(favoriteId, userId) {
    // Vérifier que le favori existe et appartient à l'utilisateur
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId }
    });

    if (!favorite) {
      throw new AppError('Favori non trouvé', 404, 'FAVORITE_NOT_FOUND');
    }

    if (favorite.userId !== userId) {
      throw new AppError(
        'Vous n\'avez pas le droit de supprimer ce favori',
        403,
        'FORBIDDEN'
      );
    }

    await prisma.favorite.delete({
      where: { id: favoriteId }
    });
  },

  /**
   * Récupère un favori par ID
   */
  async getFavoriteById(favoriteId, userId) {
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId }
    });

    if (!favorite) {
      throw new AppError('Favori non trouvé', 404, 'FAVORITE_NOT_FOUND');
    }

    if (favorite.userId !== userId) {
      throw new AppError(
        'Vous n\'avez pas accès à ce favori',
        403,
        'FORBIDDEN'
      );
    }
    return favorite;
  }
};
