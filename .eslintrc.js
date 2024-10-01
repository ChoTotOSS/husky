module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['xo-space', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'capitalized-comments': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-require-imports': 'off',
  },
  env: {
    jest: true,
    node: true,
  },
}
