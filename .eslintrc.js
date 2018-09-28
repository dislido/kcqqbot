module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'no-console': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'max-len': ['error', { code: 120 }],
    'no-mixed-operators': ['error', {'allowSamePrecedence': true}]
  }
}
