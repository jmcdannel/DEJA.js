/** @type {import('eslint').Linter.Config} */
export default {
  rules: {
    /**
     * Require camel case names.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/camelcase
     */
    camelcase: [
      "error",
      { allow: ["^UNSAFE_"], ignoreDestructuring: false, properties: "never" },
    ],
    /**
     * Require function expressions to have a name.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/func-names
     */
    "func-names": ["error", "as-needed"],
    /**
     * Require a capital letter for constructors.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/new-cap
     */
    "new-cap": ["error", { capIsNew: false }],
    /**
     * Disallow the omission of parentheses when invoking a constructor with
     * no arguments.
     *
     * 🔧 Fixable - https://eslint.org/docs/rules/new-parens
     */
    "new-parens": "warn",
    /**
     * Disallow use of the Array constructor.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/no-array-constructor
     */
    "no-array-constructor": "error",
    /**
     * Disallow use of bitwise operators.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/no-bitwise
     */
    "no-bitwise": "warn",
    /**
     * Disallow if as the only statement in an else block.
     *
     * 🔧 Fixable - https://eslint.org/docs/rules/no-lonely-if
     */
    "no-lonely-if": "warn",
    /**
     * Disallow use of chained assignment expressions.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/no-multi-assign
     */
    "no-multi-assign": ["error"],
    /**
     * Disallow nested ternary expressions.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/no-nested-ternary
     */
    "no-nested-ternary": "warn",
    /**
     * Disallow ternary operators when simpler alternatives exist.
     *
     * 🚫 Not fixable - https://eslint.org/docs/rules/no-unneeded-ternary
     */
    "no-unneeded-ternary": "error",
    /**
     * Require use of an object spread over Object.assign.
     *
     * 🔧 Fixable - https://eslint.org/docs/rules/prefer-object-spread
     */
    "prefer-object-spread": "warn",

    /**
     * This rule checks all property definitions of object expressions and verifies that all variables are sorted alphabetically.
     *
     * 🚫 Not fixable - https://eslint.org/docs/latest/rules/sort-keys
     */
    "sort-keys": [
      "warn",
      "asc",
      {
        natural: true,
      },
    ],
  },
};
