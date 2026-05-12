import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
    {
        ignores: ['**/dist', '**/*.css', '**/node_modules'],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
        },
        plugins: {
            'react-refresh': reactRefreshPlugin,
        },
        rules: {
            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true,
                },
            ],
        },
    },
];
