/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from "rollup-plugin-summary"
import nodeResolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import dotenv from "dotenv"
import typescript from "@rollup/plugin-typescript"
import copy from "rollup-plugin-copy"
import dynamicImportVariables from "@rollup/plugin-dynamic-import-vars"
import terser from "@rollup/plugin-terser"

// Load environment variables from .env file
dotenv.config()

const production = process.env.MODE !== "dev"
console.log("IS PRODUCTION", production)

const elementsToCopy = [
  { src: "src/assets", dest: "dist" }, // This will copy src/assets to dist/assets
  !production && { src: "index.html", dest: "dist" }, // This will copy src/index.html to dist/index.html in development mode
].filter(Boolean)

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/off-webcomponents.ts",
  output: [
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
    },
    {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name]-[hash].cjs",
      sourcemap: true,
    },
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].min.js",
      chunkFileNames: "[name]-[hash].min.js",
      plugins: [
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
      ],
    },
  ],
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
    dynamicImportVariables({
      errorWhenNoFilesFound: true,
    }),
    nodeResolve(),

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

    copy({
      targets: elementsToCopy,
    }),
    summary(),
  ],
}
