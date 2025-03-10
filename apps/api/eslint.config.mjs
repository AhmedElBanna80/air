import createConfig from "@tasks-app/eslint-config/create-config";
import drizzle from "eslint-plugin-drizzle";

export default createConfig({
  ignores: ["src/db/migrations/*", "public/*"],
  plugins: { drizzle },
  rules: {
    ...drizzle.configs.recommended.rules,
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md", "src/services/db/migrations/*"],
    }],
  },
});
