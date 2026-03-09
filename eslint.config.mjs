import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import-x'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
})

// Configurações comuns reutilizáveis
const baseRules = {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
        'warn',
        {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
        },
    ],
    'import-x/order': [
        'warn',
        {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
        },
    ],
    'prettier/prettier': [
        'error',
        {
            semi: false,
            tabWidth: 2,
            useTabs: false,
            printWidth: 100,
        },
    ],
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
            ignore: [-1, 0, 1],
            ignoreArrayIndexes: true,
            ignoreDefaultValues: true,
            ignoreEnums: true,
            ignoreNumericLiteralTypes: true,
            ignoreReadonlyClassProperties: true,
        }
    ],
    'curly': ['warn', 'multi-or-nest'],
}

const basePlugins = {
    '@typescript-eslint': typescriptEslintEslintPlugin,
    'import-x': importPlugin,
}

export default [
    {
        ignores: [
            'eslint.config.mjs',
            'node_modules/**',
            '**/node_modules/**',
            '**/coverage/**',
            '**/build/**',
            '**/dist/**',
            '**/.output/**',
            'gists/**',
            '*.min.js',
        ],
    },
    ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
    {
        files: ['apps/backend/**/*.ts'],
        plugins: basePlugins,
        languageOptions: {
            globals: { ...globals.node },
            parser: tsParser,
            sourceType: 'module',
            parserOptions: {
                project: './apps/backend/tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        rules: baseRules,
    },

    // Frontend TypeScript (não-Vue)
    {
        files: ['apps/dashboard/**/*.ts'],
        plugins: basePlugins,
        languageOptions: {
            globals: { ...globals.node },
            parser: tsParser,
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: baseRules,
    },

    // Vue files
    {
        files: ['apps/dashboard/**/*.vue'],
        plugins: { ...basePlugins, vue: pluginVue },
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parser: vueParser,
            sourceType: 'module',
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.vue'],
                ecmaFeatures: { jsx: true },
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            ...pluginVue.configs.essential.rules,
            ...baseRules,
            'vue/multi-word-component-names': 'off',
            'vue/no-unused-vars': 'warn',
            'vue/no-multiple-template-root': 'off',
            'vue/no-reserved-props': 'off',
            'vue/no-v-model-argument': 'off',
            'vue/no-v-for-template-key': 'off',
        },
    },

    // Sobrescrições específicas
    {
        files: ['**/*.it-spec.*', 'apps/dashboard/**/*'],
        rules: {
            '@typescript-eslint/no-magic-numbers': 'off',
        },
    },
]