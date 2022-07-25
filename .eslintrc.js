module.exports = {
    'parser': '@typescript-eslint/parser',
    'plugins': [
        '@typescript-eslint'
    ],
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'env': {
        'es6': true,
        'node': true,
        'es2020': true,
        'browser': true
    },
    'parserOptions': {
        'ecmaVersion': 11,
        'sourceType': 'module'
    },
    'rules': {
        '@typescript-eslint/no-var-requires': 'off',
        'indent': [
            'warn',
            4,
            {
                'SwitchCase': 1
            }
        ],
        'quotes': [
            'warn',
            'single'
        ],
        'semi': [
            'warn',
            'never'
        ],
        'no-unused-vars': [
            'warn',
        ],
        'brace-style': [
            'warn',
            '1tbs'
        ],
        'keyword-spacing': [
            'warn',
            {
                'before': true,
                'after': true
            }
        ],
        'object-curly-spacing': [
            'warn',
            'always'
        ],
        'camelcase': [
            'warn',
            {
                'properties': 'always'
            }
        ],
    },
    'ignorePatterns': [
        'node_modules',
        'dist',
        '.git',
        'build',

        'out',
        '**/*.d.ts'
    ]
}
