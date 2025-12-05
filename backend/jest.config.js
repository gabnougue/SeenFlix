export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  verbose: true
};
