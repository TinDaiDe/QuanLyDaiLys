/**
 * Cấu hình ESLint (flat config, ESLint 9) - bộ quy tắc chuẩn code của nhóm.
 * Chạy kiểm tra: npm run lint
 */

const js = require("@eslint/js");

const NODE_GLOBALS = {
  require: "readonly",
  module: "writable",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  setTimeout: "readonly"
};

const JEST_GLOBALS = {
  describe: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  jest: "readonly"
};

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: NODE_GLOBALS
    },
    rules: {
      camelcase: ["error", { properties: "never" }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "max-params": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 50, skipComments: true, skipBlankLines: true }],
      complexity: ["warn", 10]
    }
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: { ...NODE_GLOBALS, ...JEST_GLOBALS }
    },
    rules: {
      "max-lines-per-function": "off"
    }
  }
];
