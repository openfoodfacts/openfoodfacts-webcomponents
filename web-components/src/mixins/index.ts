// TypeScript requires mixin constructors to take a single `...args: any[]` rest parameter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T
