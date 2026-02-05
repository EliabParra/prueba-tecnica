export interface CategoryDTO {
  id: number
  name?: string | null
  description?: string | null
}

export interface CreateCategoryDTO {
  name: string
  description?: string | null
}
