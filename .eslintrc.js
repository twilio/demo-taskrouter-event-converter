module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "airbnb-base",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "settings": {
      "import/resolver": {
        "node": {
          "extensions": [".js", ".ts"]
        }
      }
    },
    "rules": {
      "import/prefer-default-export": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/camelcase": 0
    },
    "overrides": [
      {
        "files": ["**/*.test.ts"],
        "env": {
          "jest": true
        },
        "rules": {
          "@typescript-eslint/ban-ts-ignore": 0
        }
      }
    ]
};
