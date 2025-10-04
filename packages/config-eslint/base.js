import bestPracticeConfig from "./rules/best-practice.js";
import commentConfig from "./rules/comments.js";
import es6Config from "./rules/es6.js";
import importConfig from "./rules/import.js";
import possibleErrorsConfig from "./rules/possible-errors.js";
import stylisticConfig from "./rules/stylistic.js";
import turboConfig from "eslint-config-turbo/flat";
import unicornConfig from "./rules/unicorn.js";
import variablesConfig from "./rules/variables.js";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import { cwd } from "node:process";
import { resolve } from "node:path";
import tsDoc from "./rules/tsdoc.js";
import typescript from "./rules/typescript/index.js";
import typescriptExtension from "./rules/typescript/extension.js";
import typescriptImport from "./rules/typescript/import.js";

const project = resolve(cwd(), "tsconfig.json");

// Create a combined import config that includes both the recommended rules and your custom rules
const importCombinedConfig = {
  plugins: {
    import: importPlugin,
  },
  rules: {
    ...importPlugin.flatConfigs.recommended.rules,
    ...importConfig.rules,
  },
};

const tsCombinedConfig = {
  plugins: {
    ...tsDoc.plugins,
  },
  rules: {
    ...typescript.rules,
    ...typescriptExtension.rules,
    ...typescriptImport.rules,
    ...tsDoc.rules,
  },
};

// Merge configurations
/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    turboConfig,
    bestPracticeConfig,
    commentConfig,
    es6Config,
    importCombinedConfig,
    possibleErrorsConfig,
    tsCombinedConfig,
    stylisticConfig,
    unicornConfig,
    variablesConfig,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: project,
        },
      },
      settings: {
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
          typescript: {
            project,
          },
          node: {
            extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
          },
        },
      },
    },
  ),

  // Global settings that apply to all files
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    ignores: ["node_modules/**", "dist/**"],
  },
];

export default config;
