import eslintPluginTsdoc from "eslint-plugin-tsdoc";

/** @type {import('eslint').Linter.FlatConfig} */
const config = {
  plugins: {
    tsdoc: eslintPluginTsdoc,
  },
  rules: {
    /**
     * Require TSDoc comments conform to the TSDoc specification.
     *
     * 🚫 Not fixable - https://github.com/microsoft/tsdoc/tree/master/eslint-plugin
     */
    "tsdoc/syntax": "off",
  },
};

export default config;
