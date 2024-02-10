/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  "extends": "next",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
};
