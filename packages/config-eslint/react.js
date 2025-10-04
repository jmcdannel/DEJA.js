import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactCompilerPlugin from "eslint-plugin-react-compiler";
import globals from "globals";

import baseConfig from "./base.js";
import jsxA11yConfig from "./rules/jsx-a11y.js";
import reactConfig from "./rules/react.js";

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-compiler": reactCompilerPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        React: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  jsxA11yConfig,
  reactConfig,
];

export default config;
