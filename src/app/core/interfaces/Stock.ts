import { Store } from './Store';
import { Product } from './Product';
export interface Stock {
  id?: string
  productId: string
  storeId: string
  quantity: number
}

export interface StockDisplay {
  id?: string
  store: Store
  product: Product
  quantity: number
}
