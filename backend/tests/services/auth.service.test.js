/**
 * Tests unitaires pour auth.service.js
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock de Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

// Mock du module Prisma
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Import du service après les mocks
const { registerUser, loginUser } = await import('../../src/services/auth.service.js');

describe('Auth Service', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('devrait créer un nouvel utilisateur avec un mot de passe hashé', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      // Mock: l'utilisateur n'existe pas encore
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Mock: création de l'utilisateur
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email,
        passwordHash: hashedPassword,
        createdAt: new Date()
      });

      // Mock de bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const result = await registerUser(email, password);

      // Vérifications
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash: hashedPassword
        }
      });
      expect(result.email).toBe(email);
    });

    it('devrait rejeter si l\'email existe déjà', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      // Mock: l'utilisateur existe déjà
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email,
        passwordHash: 'some_hash'
      });

      // Vérifier que l'erreur est levée
      await expect(registerUser(email, password)).rejects.toThrow('EMAIL_ALREADY_USED');

      // Vérifier que create n'a pas été appelé
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('devrait connecter un utilisateur avec des credentials valides', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: 1,
        email,
        passwordHash: hashedPassword
      };

      // Mock: l'utilisateur existe
      mockPrisma.user.findUnique.mockResolvedValue(user);

      // Mock de bcrypt.compare pour retourner true
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock de jwt.sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mock_token');

      const result = await loginUser(email, password);

      // Vérifications
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result.accessToken).toBe('mock_token');
      expect(result.refreshToken).toBe('mock_token');
      expect(result.user).toEqual(user);
    });

    it('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Mock: l'utilisateur n'existe pas
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser(email, password)).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('devrait rejeter si le mot de passe est incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrong_password';
      const user = {
        id: 1,
        email,
        passwordHash: 'hashed_password'
      };

      // Mock: l'utilisateur existe
      mockPrisma.user.findUnique.mockResolvedValue(user);

      // Mock de bcrypt.compare pour retourner false
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(loginUser(email, password)).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });
});
