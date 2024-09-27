// jest.config.js
module.exports = {
    preset: 'ts-jest', // Use ts-jest to compile TypeScript
    testEnvironment: 'node', // Set the test environment to Node.js
    transform: {
        '^.+\\.ts$': 'ts-jest', // Handle TypeScript files
    },
    moduleFileExtensions: ['ts', 'js',],
    globals: {
        'ts-jest': {
            useESM: true,
            isolatedModules: true, // Disable type-checking
        },
    },
    // Match both unit and integration tests
    testMatch: [
        '**/?(*.)+(unit|integration).test.ts',  // Matches unit and integration tests
    ],
    // Other Jest configuration options...
    collectCoverage: true, // Enable coverage collection
    collectCoverageFrom: [
        'src/**/*.ts', // Adjust this pattern to include your source files
        '!src/**/*.d.ts', // Exclude TypeScript declaration files
        '!src/**/__tests__/**', // Exclude test files
    ],
    coverageDirectory: 'coverage', // Directory where coverage reports will be saved
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
}
