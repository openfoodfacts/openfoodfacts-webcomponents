<<<<<<< HEAD
// Set signal object state attribute

import { Signal, State } from "@lit-labs/signals"

export type SignalMapType<T> = Record<string, T>


export class SignalMap<T> extends State<SignalMapType<T> {
  constructor(initialValue: SignalMapType<T>, options: Signal.Options<SignalMapType<T>> = {}) {
    super(initialValue, options)
  }

  getItem(key: string): T {
    return super.get()[key]
  }

  setItem(key: string, value: T) {
    super.set({ ...super.get(), [key]: value })
  }
=======
// Do not use Object assign because it does not work with signals watchers
export const setSignalObjectStateAttribute = (signal: any, attribute: string, value: any) => {
  signal.set({ ...signal.get(), [attribute]: value })
>>>>>>> e647021 (feat: update store to handle multiple components)
}
