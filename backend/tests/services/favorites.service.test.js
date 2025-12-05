/**
 * Tests unitaires pour favorites.service.js
 */

import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  favorite: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock du module Prisma
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock d'axios
const mockAxios = {
  get: jest.fn()
};
jest.unstable_mockModule('axios', () => ({
  default: mockAxios
}));

// Import du service après les mocks
const { favoritesService } = await import('../../src/services/favorites.service.js');

describe('Favorites Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFavorites', () => {
    it('devrait retourner les favoris enrichis avec les données TMDB', async () => {
      const userId = 1;
      const favorites = [
        {
          id: 1,
          userId: 1,
          tmdbId: 550,
          type: 'movie',
          rating: 5,
          comment: 'Excellent film',
          createdAt: new Date()
        }
      ];

      mockPrisma.favorite.findMany.mockResolvedValue(favorites);
      mockAxios.get.mockResolvedValue({
        data: {
          title: 'Fight Club',
          poster_path: '/poster.jpg',
          overview: 'An insomniac office worker...',
          release_date: '1999-10-15',
          vote_average: 8.4
        }
      });

      const result = await favoritesService.getUserFavorites(userId);

      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      expect(result[0].title).toBe('Fight Club');
      expect(result[0].posterPath).toBe('/poster.jpg');
      expect(result[0].voteAverage).toBe(8.4);
    });

    it('devrait gérer l\'absence de clé TMDB', async () => {
      const userId = 1;
      const favorites = [
        {
          id: 1,
          userId: 1,
          tmdbId: 550,
          type: 'movie',
          rating: 5,
          comment: 'Excellent film',
          createdAt: new Date()
        }
      ];

      // Sauvegarder la clé originale
      const originalApiKey = process.env.TMDB_API_KEY;
      delete process.env.TMDB_API_KEY;

      mockPrisma.favorite.findMany.mockResolvedValue(favorites);

      const result = await favoritesService.getUserFavorites(userId);

      expect(result).toEqual(favorites);

      // Restaurer la clé
      process.env.TMDB_API_KEY = originalApiKey;
    });
  });

  describe('addFavorite', () => {
    it('devrait ajouter un favori', async () => {
      const userId = 1;
      const favoriteData = {
        tmdbId: 550,
        type: 'movie',
        rating: 5,
        comment: 'Super film!'
      };

      const createdFavorite = {
        id: 1,
        userId,
        ...favoriteData,
        createdAt: new Date()
      };

      mockPrisma.favorite.create.mockResolvedValue(createdFavorite);

      const result = await favoritesService.addFavorite(userId, favoriteData);

      expect(mockPrisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...favoriteData
        }
      });
      expect(result).toEqual(createdFavorite);
    });

    it('devrait rejeter si le favori existe déjà (contrainte unique)', async () => {
      const userId = 1;
      const favoriteData = {
        tmdbId: 550,
        type: 'movie',
        rating: 5,
        comment: 'Super film!'
      };

      // Simuler une erreur Prisma de contrainte unique
      const prismaError = new Error('Unique constraint failed');
      prismaError.code = 'P2002';
      mockPrisma.favorite.create.mockRejectedValue(prismaError);

      await expect(
        favoritesService.addFavorite(userId, favoriteData)
      ).rejects.toThrow('Ce contenu est déjà dans vos favoris');
    });
  });

  describe('deleteFavorite', () => {
    it('devrait supprimer un favori appartenant à l\'utilisateur', async () => {
      const favoriteId = 1;
      const userId = 1;

      mockPrisma.favorite.findUnique.mockResolvedValue({
        id: favoriteId,
        userId,
        tmdbId: 550,
        type: 'movie'
      });

      mockPrisma.favorite.delete.mockResolvedValue({});

      await favoritesService.deleteFavorite(favoriteId, userId);

      expect(mockPrisma.favorite.findUnique).toHaveBeenCalledWith({
        where: { id: favoriteId }
      });
      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({
        where: { id: favoriteId }
      });
    });

    it('devrait rejeter si le favori n\'existe pas', async () => {
      const favoriteId = 999;
      const userId = 1;

      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      await expect(
        favoritesService.deleteFavorite(favoriteId, userId)
      ).rejects.toThrow('Favori non trouvé');
    });

    it('devrait rejeter si l\'utilisateur n\'est pas le propriétaire', async () => {
      const favoriteId = 1;
      const userId = 1;
      const otherUserId = 2;

      mockPrisma.favorite.findUnique.mockResolvedValue({
        id: favoriteId,
        userId: otherUserId,
        tmdbId: 550,
        type: 'movie'
      });

      await expect(
        favoritesService.deleteFavorite(favoriteId, userId)
      ).rejects.toThrow('Vous n\'avez pas le droit de supprimer ce favori');
    });
  });

  describe('updateFavorite', () => {
    it('devrait mettre à jour un favori', async () => {
      const favoriteId = 1;
      const userId = 1;
      const updateData = { rating: 4, comment: 'Bon film' };

      mockPrisma.favorite.findUnique.mockResolvedValue({
        id: favoriteId,
        userId,
        tmdbId: 550,
        type: 'movie',
        rating: 5,
        comment: 'Excellent'
      });

      mockPrisma.favorite.update.mockResolvedValue({
        id: favoriteId,
        userId,
        tmdbId: 550,
        type: 'movie',
        ...updateData
      });

      const result = await favoritesService.updateFavorite(favoriteId, userId, updateData);

      expect(mockPrisma.favorite.update).toHaveBeenCalledWith({
        where: { id: favoriteId },
        data: updateData
      });
      expect(result.rating).toBe(4);
      expect(result.comment).toBe('Bon film');
    });

    it('devrait rejeter si le favori n\'appartient pas à l\'utilisateur', async () => {
      const favoriteId = 1;
      const userId = 1;
      const otherUserId = 2;
      const updateData = { rating: 4 };

      mockPrisma.favorite.findUnique.mockResolvedValue({
        id: favoriteId,
        userId: otherUserId,
        tmdbId: 550,
        type: 'movie'
      });

      await expect(
        favoritesService.updateFavorite(favoriteId, userId, updateData)
      ).rejects.toThrow('Vous n\'avez pas le droit de modifier ce favori');
    });
  });

  describe('getFavoriteById', () => {
    it('devrait retourner un favori par son ID', async () => {
      const favoriteId = 1;
      const userId = 1;
      const favorite = {
        id: favoriteId,
        userId,
        tmdbId: 550,
        type: 'movie',
        rating: 5,
        comment: 'Excellent'
      };

      mockPrisma.favorite.findUnique.mockResolvedValue(favorite);

      const result = await favoritesService.getFavoriteById(favoriteId, userId);

      expect(result).toEqual(favorite);
    });

    it('devrait rejeter si le favori n\'existe pas', async () => {
      const favoriteId = 999;
      const userId = 1;

      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      await expect(
        favoritesService.getFavoriteById(favoriteId, userId)
      ).rejects.toThrow('Favori non trouvé');
    });
  });
});
