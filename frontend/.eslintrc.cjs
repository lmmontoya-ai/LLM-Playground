module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    "standard-with-typescript",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  plugins: ["react", "@typescript-eslint"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
};
