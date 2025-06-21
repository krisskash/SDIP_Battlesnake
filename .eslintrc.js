module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  plugins: [
    'jest',
    'eslint-comments',
    'sonarjs',
    'unicorn'
  ],
  env: {
    es2020: true,
    node: true,
    'jest/globals': true
  },
  rules: {
    // custom rules here
  }
};