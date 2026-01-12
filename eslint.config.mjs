// eslint.config.mjs
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-node';
import prettier from 'eslint-config-prettier';

export default [
    // global ignores
    {
        ignores: ['node_modules', 'dist', 'build', '.env', '.turbo', '.cache'],
    },

    // base JS rules (recommended)
    js.configs.recommended,

    // TypeScript files
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            // If you want type-aware rules (slower), uncomment and set project:
            // parserOptions: { project: ['./tsconfig.json'] }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
            node: nodePlugin,
        },
        rules: {
            // include TS plugin recommended rules
            ...tsPlugin.configs.recommended.rules,

            // Prettier integration (turn off conflicting rules)
            ...prettier.rules,

            // Backend-friendly rule set (tweak as desired)
            'no-console': 'off',
            'no-unused-vars': 'off',
            "no-duplicate-imports": "error",
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',
            'import/no-unresolved': 'error',
            'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }]
        },

        // Optionally add settings if you use TS path aliases
        // settings: {
        //   'import/resolver': {
        //     typescript: { project: './tsconfig.json' }
        //   }
        // }
    },

    // tests override
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off'
        },
    },
];
