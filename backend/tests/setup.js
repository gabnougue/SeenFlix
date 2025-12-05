/**
 * Configuration globale des tests
 * Ce fichier est exécuté avant tous les tests
 */

// Variables d'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';
process.env.TMDB_API_KEY = 'test-tmdb-api-key';
