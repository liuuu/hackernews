module.exports = {
  extends: 'airbnb',
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'import/no-extraneous-dependencies': 0,
    'react/prefer-stateless-function': 0,
    'react/no-multi-comp': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': 1,
    'jsx-a11y/no-static-element-interactions': 1,
    'jsx-a11y/click-events-have-key-events': 1,
    'prefer-destructuring': 1,
    'max-len': 1,
  },
  parser: 'babel-eslint',
  globals: {
    document: 1,
  },
  env: {
    browser: 1,
  },
};
