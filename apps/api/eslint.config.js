import { config } from "@workspace/eslint-config/base";
import drizzle from "eslint-plugin-drizzle";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    plugins: {
      drizzle,
    },
  },
  {
    rules: {
      ...drizzle.configs.recommended.rules,
    },
  },
];
