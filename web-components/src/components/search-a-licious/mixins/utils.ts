/**
 * This mixin represents a mixin type
 *
 * We need it for every mixin we declare.
 */

export type Constructor<T = {}> = new (...args: any[]) => T
