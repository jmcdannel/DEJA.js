import baseConfig from "@repo/eslint-config/base.js";

/** @type {import('eslint').Linter.Config[]} */
export default [...(Array.isArray(baseConfig) ? baseConfig : [baseConfig])];
