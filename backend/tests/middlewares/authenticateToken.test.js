/**
 * Tests unitaires pour authenticateToken middleware
 */

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middlewares/authenticateToken.js';

describe('authenticateToken middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock de la requête
    req = {
      headers: {}
    };

    // Mock de la réponse
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock de next
    next = jest.fn();
  });

  it('devrait appeler next() avec un token valide', () => {
    const userId = 1;
    const email = 'test@example.com';
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: userId, email });
  });

  it('devrait retourner 401 si l\'header Authorization est manquant', () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: missing Authorization header'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token n\'est pas fourni', () => {
    req.headers['authorization'] = 'Bearer ';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: token not provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token est invalide', () => {
    req.headers['authorization'] = 'Bearer invalid_token';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: invalid or expired token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token est expiré', () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'test@example.com' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' } // Token expiré
    );

    req.headers['authorization'] = `Bearer ${expiredToken}`;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: invalid or expired token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le format de l\'header est incorrect', () => {
    req.headers['authorization'] = 'InvalidFormat';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
