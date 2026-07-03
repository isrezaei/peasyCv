/**
 * Unit-test config (no database). Runs *.spec.ts under src/.
 * End-to-end tests live in test/ and use test/jest-e2e.json.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@resume/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  collectCoverageFrom: ['**/*.ts'],
  testEnvironment: 'node',
};
