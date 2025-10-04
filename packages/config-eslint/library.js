import baseConfig from "./base.js";

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = Array.isArray(baseConfig) ? [...baseConfig] : [baseConfig];

export default config;
