import turboPlugin from "eslint-plugin-turbo"

import createConfig from "./create-config.js"

const val = await createConfig({
  ignores: ["dist/**"],
  plugins: { turbo: turboPlugin, },
  rules: {
    ...turboPlugin.configs.recommended.rules,
  },
});

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  ...val
]
