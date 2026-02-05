import { Warehouse } from './Warehouse';
import { Product } from './Product';
export interface Stock {
  id?: string
  productId: number | string
  warehouseId: number | string
  quantity: number
}

export interface StockDisplay {
  id?: string
  warehouse: Warehouse
  product: Product
  quantity: number
}
