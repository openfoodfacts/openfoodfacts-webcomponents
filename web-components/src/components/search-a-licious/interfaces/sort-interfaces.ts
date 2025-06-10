export interface SortParameters {
  sort_by?: string

  sort_params?: Record<string, any>
}

export interface SearchaliciousSortInterface {
  getSortParameters(): SortParameters | null
  setSortOptionById(optionId: string | undefined): void
}
