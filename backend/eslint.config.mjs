// Flat ESLint config for the backend (TypeScript-aware). The strict `tsc`
// typecheck does the heavy type analysis; ESLint focuses on lint-level issues.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "uploads/**",
      "prisma/migrations/**",
      "eslint.config.mjs",
      "jest.config.js",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Decorator-heavy Nest code and JSON round-trips occasionally need `any`.
      "@typescript-eslint/no-explicit-any": "off",
      // Allow intentionally-unused params/vars when prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
);
