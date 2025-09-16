/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Permite importar rutas ESM con sufijo .js apuntando a los .ts reales durante tests
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },
  // Opcionalmente: limpia mocks entre tests
  // clearMocks: true,
  // resetMocks: true,
};
