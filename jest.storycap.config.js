/** @type {import('jest').Config} */
module.exports = {
  displayName: 'storycap-visual',
  testMatch: ['<rootDir>/visual-tests/**/*.test.ts', '<rootDir>/visual-tests/**/*.test.js'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'node',
  // Each test file gets its own timeout — screenshots can take time
  testTimeout: 30000,
  // Reporter for cleaner output
  reporters: ['default'],
};
