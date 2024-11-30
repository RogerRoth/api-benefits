import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {
    languageOptions: { globals: globals.node },
    rules: {
      "no-useless-constructor": "off",
      "no-new": "off",
      "no-explicit-any": true
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];