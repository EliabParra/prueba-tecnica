import { Injectable } from '@angular/core';
import { Product } from './interfaces/Product';
import { FireDBService } from './services/firedb.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor (
    private db: FireDBService,
  ) {
    this.syncDB().then()
  }

  products: Product[] = []

  private productsSubject = new BehaviorSubject<Product[]>([])
  public products$ = this.productsSubject.asObservable()

  async syncDB() {
    const productsSnapshot = await this.db.getAll('products')
    productsSnapshot.subscribe((productsData: any) => {
      this.products = productsData.map((item: any) => {
        const data = item.payload.val()
        if ((!data || !data.id) && item.key) data.id = item.key
        return data as Product
      })
      this.productsSubject.next(this.products)
    })
  }

  async addProduct(product: Product): Promise<Product> {
    const productResult: Product = await this.db.create(
      'products', product
    )
    await this.syncDB()
    return productResult
  }

  getProducts(): Product[] {
    return this.products
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = this.products.find(p => p.id === id)
    return product
  }

  async updateProduct(product: Product): Promise<Product> {
    const productResult: Product = await this.db.update(
      'products', product.id, product
    )
    await this.syncDB()
    return productResult
  }

  async deleteProduct(id: string): Promise<string> {
    const deletedId: string = await this.db.delete(
      'products', id
    )
    await this.syncDB()
    return deletedId
  }
}
