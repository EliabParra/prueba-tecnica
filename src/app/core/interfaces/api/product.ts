export interface ProductDTO {
  id: number
  name?: string | null
  description?: string | null
  price: number
  unitOfMeasure?: string | null
  minStock: number
  categoryId: number
  categoryName?: string | null
}

export interface ProductListDTO {
  id: number
  name?: string | null
  description?: string | null
  price: number
  unitOfMeasure?: string | null
  minStock: number
  categoryId: number
  categoryName?: string | null
}

export interface CreateProductDTO {
  name: string
  description?: string | null
  price: number
  unitOfMeasure: string
  minStock?: number
  categoryId: number
}

export interface UpdateProductDTO {
  name: string
  description?: string | null
  price: number
  unitOfMeasure: string
  minStock?: number
  categoryId: number
}
