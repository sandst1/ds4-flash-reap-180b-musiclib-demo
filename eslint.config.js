import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tse from "typescript-eslint";

export default [
  { ignores: ["**/*.sql", "**/dist/**", "node_modules/**", "*.db"] },

  { settings: { react: { version: "detect" } } },

  pluginJs.configs.recommended,
  ...tse.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],

  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },

  {
    files: ["server/**/*.js", "server/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "warn",
    },
  },

  {
    files: ["client/**/*.jsx", "client/**/*.js", "client/**/*.tsx", "client/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "react/prop-types": "off",
    },
  },

  {
    files: ["client/**/*.test.jsx", "client/**/*.test.js", "client/**/*.test.tsx", "client/**/*.test.ts"],
    languageOptions: {
      globals: { vi: "readonly", global: "readonly" },
    },
  },
];
