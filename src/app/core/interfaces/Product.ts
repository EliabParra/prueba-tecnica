export interface Product {
  id?: number | string
  name: string
  description?: string | null
  price?: number
  unitOfMeasure?: string | null
  minStock?: number
  categoryId?: number
  categoryName?: string | null
}
