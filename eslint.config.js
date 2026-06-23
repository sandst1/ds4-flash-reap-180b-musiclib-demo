import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["**/*.sql", "dist/**", "node_modules/**", "*.db"] },

  { settings: { react: { version: "detect" } } },

  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],

  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },

  {
    files: ["server/**/*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "warn",
    },
  },

  {
    files: ["client/**/*.jsx"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
];
