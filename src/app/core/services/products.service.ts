import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertsService } from './alerts.service';
import { Product } from '../interfaces/Product';
import { CreateProductDTO, ProductDTO, ProductListDTO, UpdateProductDTO } from '../interfaces/api/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor (
    private http: HttpClient,
    private alertsService: AlertsService
  ) {
  }

  products: Product[] = []

  private readonly baseUrl = `${environment.apiUrl}/api/products`

  private productsSubject = new BehaviorSubject<Product[]>([])
  public products$ = this.productsSubject.asObservable()

  async syncDB() {
    try {
      const products = await this.http.get<ProductListDTO[]>(this.baseUrl).toPromise()
      this.products = (products || []).map(p => this.mapListDtoToProduct(p))
      this.productsSubject.next(this.products)
    } catch {
      this.products = []
      this.productsSubject.next([])
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los artículos'
      })
    }
  }

  async addProduct(product: Product): Promise<Product> {
    const payload: CreateProductDTO = {
      name: product.name,
      description: product.description ?? null,
      price: product.price ?? 0,
      unitOfMeasure: product.unitOfMeasure ?? '',
      minStock: product.minStock ?? 0,
      categoryId: product.categoryId ?? 0
    }
    const created = await this.http.post<ProductDTO>(this.baseUrl, payload).toPromise()
    if (created) {
      this.alertsService.showAlert({ type: 'success', title: 'Producto agregado', message: 'Se agregó el producto ' + created.name })
      await this.syncDB()
      return this.mapDtoToProduct(created)
    }
  }

  getProducts(): Product[] {
    return this.products
  }

  async getProduct(id: number | string): Promise<Product | undefined> {
    const product = this.products.find(p => p.id === id)
    return product
  }

  async updateProduct(product: Product): Promise<Product> {
    const payload: UpdateProductDTO = {
      name: product.name,
      description: product.description ?? null,
      price: product.price ?? 0,
      unitOfMeasure: product.unitOfMeasure ?? '',
      minStock: product.minStock ?? 0,
      categoryId: product.categoryId ?? 0
    }
    const productId = Number(product.id)
    await this.http.put(`${this.baseUrl}/${productId}`, payload).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Producto actualizado', message: 'Se actualizó el producto ' + product.name })
    await this.syncDB()
    return product
  }

  async deleteProduct(product: Product): Promise<string> {
    const productId = Number(product.id)
    await this.http.delete(`${this.baseUrl}/${productId}`).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Producto eliminado', message: 'Se eliminó el producto ' + product.name })
    await this.syncDB()
    return String(productId)
  }

  private mapListDtoToProduct(dto: ProductListDTO): Product {
    return {
      id: dto.id,
      name: dto.name ?? '',
      description: dto.description ?? null,
      price: dto.price,
      unitOfMeasure: dto.unitOfMeasure ?? null,
      minStock: dto.minStock,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName ?? null
    }
  }

  private mapDtoToProduct(dto: ProductDTO): Product {
    return {
      id: dto.id,
      name: dto.name ?? '',
      description: dto.description ?? null,
      price: dto.price,
      unitOfMeasure: dto.unitOfMeasure ?? null,
      minStock: dto.minStock,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName ?? null
    }
  }
}
