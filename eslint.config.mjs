import { defineConfig } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import configIgnores from 'eslint-plugin-spellbookx/ignores';
import { configJavascript } from 'eslint-plugin-spellbookx/javascript';
import { configJson } from 'eslint-plugin-spellbookx/json';
import { configMarkdown } from 'eslint-plugin-spellbookx/markdown';
import { configVuoto } from 'eslint-plugin-spellbookx/vuoto';

export default defineConfig([
  configIgnores,
  {
    ignores: ['**/.react-router/**'],
  },
  configJavascript,
  configJson,
  configMarkdown,
  configVuoto,
  prettierRecommended,
]);
