module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/setup.ts', '<rootDir>/__tests__/__mocks__/'],
  moduleNameMapper: {
    '^@camera/(.*)$':   '<rootDir>/src/camera/$1',
    '^@components/(.*)$':'<rootDir>/src/components/$1',
    '^@db/(.*)$':       '<rootDir>/src/database/$1',
    '^@sync/(.*)$':     '<rootDir>/src/sync/$1',
    '^@network/(.*)$':  '<rootDir>/src/network/$1',
    '^@screens/(.*)$':  '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$':    '<rootDir>/src/hooks/$1',
    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$':    '<rootDir>/src/utils/$1',
    '^@height/(.*)$':   '<rootDir>/src/height/$1',
    '\\.tflite$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-sqlite-storage|react-native-background-fetch|@react-native-community/netinfo|react-native-fs|uuid|lucide-react-native|react-native-get-random-values|@op-engineering/op-sqlite|@react-native-async-storage)/)',
  ],
  collectCoverageFrom: [
    'src/height/**/*.{ts,tsx}',
    'src/database/**/*.{ts,tsx}',
    'src/sync/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};

