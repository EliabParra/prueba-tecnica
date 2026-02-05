import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertsService } from './alerts.service';
import { Warehouse } from '../interfaces/Warehouse';
import { WarehouseDTO } from '../interfaces/api/warehouse';

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {

  constructor (
    private http: HttpClient,
    private alertsService: AlertsService
  ) {
  }

  warehouses: Warehouse[] = []

  private readonly baseUrl = `${environment.apiUrl}/api/warehouses`

  private warehousesSubject = new BehaviorSubject<Warehouse[]>([])
  public warehouses$ = this.warehousesSubject.asObservable()

  async syncDB() {
    try {
      const warehouses = await this.http.get<WarehouseDTO[]>(this.baseUrl).toPromise()
      this.warehouses = (warehouses || []).map(s => this.mapDtoToWarehouse(s))
      this.warehousesSubject.next(this.warehouses)
    } catch {
      this.warehouses = []
      this.warehousesSubject.next([])
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los almacenes'
      })
    }
  }

  async addWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    const created = await this.http.post<WarehouseDTO>(this.baseUrl, this.mapWarehouseToDto(warehouse)).toPromise()
    if (created) {
      this.alertsService.showAlert({ type: 'success', title: 'Almacén agregado', message: 'Se agregó el almacén ' + created.name })
      await this.syncDB()
      return this.mapDtoToWarehouse(created)
    }
  }

  getWarehouses(): Warehouse[] {
    return this.warehouses
  }

  async getWarehouse(id: number | string): Promise<Warehouse | undefined> {
    const warehouse = this.warehouses.find(p => p.id === id)
    return warehouse
  }

  async updateWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    const warehouseId = Number(warehouse.id)
    await this.http.put(`${this.baseUrl}/${warehouseId}`, this.mapWarehouseToDto(warehouse)).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Almacén actualizado', message: 'Se actualizó el almacén ' + warehouse.name })
    await this.syncDB()
    return warehouse
  }

  async deleteWarehouse(warehouse: Warehouse): Promise<string> {
    const warehouseId = Number(warehouse.id)
    await this.http.delete(`${this.baseUrl}/${warehouseId}`).toPromise()
    this.alertsService.showAlert({ type: 'success', title: 'Almacén eliminado', message: 'Se eliminó el almacén ' + warehouse.name })
    await this.syncDB()
    return String(warehouseId)
  }

  private mapDtoToWarehouse(dto: WarehouseDTO): Warehouse {
    return {
      id: dto.id,
      name: dto.name ?? '',
      location: dto.location ?? null
    }
  }

  private mapWarehouseToDto(warehouse: Warehouse): WarehouseDTO {
    return {
      id: Number(warehouse.id ?? 0),
      name: warehouse.name ?? null,
      location: warehouse.location ?? null
    }
  }
}
