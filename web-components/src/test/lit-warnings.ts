// Run before setup imports Lit through the fixture helpers.
// Suppress the startup notice while keeping other development warnings enabled.
const litGlobal = globalThis as typeof globalThis & {
  litIssuedWarnings?: Set<string>
}

litGlobal.litIssuedWarnings ??= new Set<string>()
litGlobal.litIssuedWarnings.add("dev-mode")

export {}
