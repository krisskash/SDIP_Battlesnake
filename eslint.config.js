import eslintComments from 'eslint-plugin-eslint-comments';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

export default [
  {
    ignores: ['coverage/**', 'node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.js'],
    plugins: {
      'eslint-comments': eslintComments,
      sonarjs: sonarjs,
      unicorn: unicorn,
    },
    rules: {
      'eslint-comments/no-unlimited-disable': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'unicorn/no-abusive-eslint-disable': 'error',
    },
  },
];
