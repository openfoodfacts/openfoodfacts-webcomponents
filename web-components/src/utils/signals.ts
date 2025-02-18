// Do not use Object assign because it does not work with signals watchers
export const setSignalObjectStateAttribute = (signal: any, attribute: string, value: any) => {
  signal.set({ ...signal.get(), [attribute]: value })
}
