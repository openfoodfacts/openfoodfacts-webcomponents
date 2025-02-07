/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from "rollup-plugin-summary"
import terser from "@rollup/plugin-terser"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"

// TODO fix this to get variable from the environment
const isDeveloppement = () => {
  return process?.env?.NODE_ENV !== "production" ? "development" : "production"
  // return "development"
}

export default {
  input: "off-webcomponents.js",
  output: {
    file: "off-webcomponents.bundled.js",
    format: "esm",
  },
  onwarn(warning) {
    if (warning.code !== "THIS_IS_UNDEFINED") {
      console.error(`(!) ${warning.message}`)
    }
  },
  plugins: [
    replace({ preventAssignment: false, "Reflect.decorate": "undefined" }),
    resolve(),
    /**
     * This minification setup serves the static site generation.
     * For bundling and minification, check the README.md file.
     */
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary(),
  ],
}
