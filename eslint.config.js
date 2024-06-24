import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'prettier/eslint.config.js';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginPrettier.configs.recommended,
  prettierConfig,
];
