import { resolve } from "node:path";
import { cwd } from "node:process";

// Import compat for older eslint rules
import { FlatCompat } from "@eslint/eslintrc";

// Import the react-compiler plugin
import reactCompilerPlugin from "eslint-plugin-react-compiler";

// Import configs
import baseConfig from "./base.js";
import jsxA11yConfig from "./rules/jsx-a11y.js";
import reactConfig from "./rules/react.js";

// Path setup
const project = resolve(cwd(), "tsconfig.json");

// Create compat layer
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Apply the compat layers
  ...compat.config({
    extends: ["next", "next/core-web-vitals"],
    settings: {
      next: {
        rootDir: project,
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  }),

  // Apply local base config
  ...(Array.isArray(baseConfig) ? baseConfig : [baseConfig]),

  // Custom configuration
  {
    plugins: {
      "react-compiler": reactCompilerPlugin,
    },
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
    },
    ignores: ["node_modules/", "dist/"],
    rules: {
      ...jsxA11yConfig.rules,
      ...reactConfig.rules,
      "import/no-default-export": "off",
      "tsdoc/syntax": "off",
      "react-compiler/react-compiler": "error",
    },
  },
];

export default config;
