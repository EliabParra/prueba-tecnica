import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertsService } from './alerts.service';
import { Category } from '../interfaces/Category';
import { CategoryDTO, CreateCategoryDTO } from '../interfaces/api/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private http: HttpClient,
    private alertsService: AlertsService
  ) {
  }

  categories: Category[] = []

  private readonly baseUrl = `${environment.apiUrl}/api/categories`

  private categoriesSubject = new BehaviorSubject<Category[]>([])
  public categories$ = this.categoriesSubject.asObservable()

  async syncDB() {
    try {
      const categories = await this.http.get<CategoryDTO[]>(this.baseUrl).toPromise()
      this.categories = (categories || []).map(c => this.mapDtoToCategory(c))
      this.categoriesSubject.next(this.categories)
    } catch {
      this.categories = []
      this.categoriesSubject.next([])
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las categorías'
      })
    }
  }

  async addCategory(category: Category): Promise<Category> {
    const payload: CreateCategoryDTO = {
      name: category.name ?? '',
      description: category.description ?? null
    }
    const created = await this.http.post<CategoryDTO>(this.baseUrl, payload).toPromise()
    if (created) {
      this.alertsService.showAlert({ type: 'success', title: 'Categoría agregada', message: 'Se agregó la categoría ' + created.name })
      await this.syncDB()
      return this.mapDtoToCategory(created)
    }
  }

  getCategories(): Category[] {
    return this.categories
  }

  async updateCategory(category: Category): Promise<Category> {
    await this.http.put(`${this.baseUrl}/${category.id}`, this.mapCategoryToDto(category)).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Categoría actualizada', message: 'Se actualizó la categoría ' + category.name })
    await this.syncDB()
    return category
  }

  async deleteCategory(category: Category): Promise<string> {
    await this.http.delete(`${this.baseUrl}/${category.id}`).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Categoría eliminada', message: 'Se eliminó la categoría ' + category.name })
    await this.syncDB()
    return String(category.id)
  }

  private mapDtoToCategory(dto: CategoryDTO): Category {
    return {
      id: dto.id,
      name: dto.name ?? null,
      description: dto.description ?? null
    }
  }

  private mapCategoryToDto(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name ?? null,
      description: category.description ?? null
    }
  }
}
