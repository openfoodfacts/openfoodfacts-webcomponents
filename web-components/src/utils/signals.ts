// Set signal object state attribute

import { Signal, State } from "@lit-labs/signals"

export type SignalMapType<T> = Record<string, T>

export class SignalObject<T extends Record<string, any>> extends State<T> {
  constructor(initialValue: T, options: Signal.Options<T> = {}) {
    super(initialValue, options)
  }

  getItem(key: string): T[keyof T] {
    return super.get()[key]
  }

  setItem(key: string, value: T[keyof T]) {
    super.set({ ...super.get(), [key]: value })
  }
}

export class SignalMap<T> extends SignalObject<SignalMapType<T>> {}
