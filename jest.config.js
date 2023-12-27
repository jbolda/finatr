module.exports = async () => {
  return {
    testEnvironment: 'node',
    resolver: '<rootDir>/jest.resolver.js',
    testPathIgnorePatterns: ['<rootDir>/tests/', '<rootDir>/node_modules/']
  };
};
