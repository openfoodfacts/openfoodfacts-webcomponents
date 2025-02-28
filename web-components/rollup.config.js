/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from "rollup-plugin-summary"
import terser from "@rollup/plugin-terser"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import dotenv from "dotenv"
import typescript from "@rollup/plugin-typescript"
import copy from "rollup-plugin-copy"

// Load environment variables from .env file
dotenv.config()

const production = process.env.MODE !== "dev"
console.log("IS PRODUCTION", production)

let output = []
if (production) {
  output.push(
    {
      file: "dist/off-webcomponents.bundled.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/off-webcomponents.bundled.cjs",
      format: "cjs",
      sourcemap: true,
    }
  )
} else {
  output.push({
    file: "dist/off-webcomponents.js",
    format: "esm",
    sourcemap: true,
  })
}

const elementsToCopy = [
  { src: "src/assets", dest: "dist" }, // This will copy src/assets to dist/assets
  !production && { src: "index.html", dest: "dist" }, // This will copy src/index.html to dist/index.html in development mode
].filter(Boolean)

export default {
  input: "src/off-webcomponents.ts",
  output,
  onwarn(warning) {
    if (warning.code !== "THIS_IS_UNDEFINED") {
      console.error(`(!) ${warning.message}`)
    }
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
    }),
    replace({ preventAssignment: false, "Reflect.decorate": "undefined" }),
    resolve(),

    replace({
      preventAssignment: true,
      __ENV__: JSON.stringify({
        isDevelopment: !production,
      }),
    }),

    // Currently we don't need to serve the app during development because we use web dev server
    // !production &&
    //   serve({
    //     contentBase: "dist",
    //     port: 3000,
    //     historyApiFallback: true,
    //   }),
    // !production && livereload("dist"),

    /**
     * This minification setup serves the static site generation.
     * For bundling and minification, check the README.md file.
     */
    production &&
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
    copy({
      targets: elementsToCopy,
    }),
  ],
}
