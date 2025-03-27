/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from "rollup-plugin-summary"
import terser from "@rollup/plugin-terser"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import typescript from "@rollup/plugin-typescript"
import { globSync } from "glob"

import * as litLocalize from "./lit-localize.json" with { type: "json" }

const distDir = "dist/localization/locales/"

const languageInputsDir = litLocalize.default.output.outputDir.replace("./", "")
const files = globSync(`${languageInputsDir}/*.ts`)
export default {
  input: files,
  output: [
    {
      dir: distDir,
      format: "esm",
      sourcemap: true,
    },
    // Comment because it overwrites the esm files
    // {

    //   dir: distDir,
    //   format: "cjs",
    //   sourcemap: true,
    // },
  ],
  onwarn(warning) {
    if (warning.code !== "THIS_IS_UNDEFINED") {
      console.error(`(!) ${warning.message}`)
    }
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      outDir: null,
      declaration: false,
      declarationDir: null,
    }),
    replace({ preventAssignment: false, "Reflect.decorate": "undefined" }),
    resolve(),

    replace({
      preventAssignment: true,
    }),

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
