import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { InventoryReportDTO } from '../../interfaces/api/inventory';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly baseUrl = `${environment.apiUrl}/api/reports`

  constructor(private http: HttpClient) {}

  getInventoryReport(productId?: number, warehouseId?: number) {
    let params = new HttpParams()
    if (productId) params = params.set('productId', String(productId))
    if (warehouseId) params = params.set('warehouseId', String(warehouseId))
    return this.http.get<InventoryReportDTO[]>(`${this.baseUrl}/inventory`, { params })
  }

  downloadInventoryExcel(productId?: number, warehouseId?: number) {
    let params = new HttpParams()
    if (productId) params = params.set('productId', String(productId))
    if (warehouseId) params = params.set('warehouseId', String(warehouseId))
    return this.http.get(`${this.baseUrl}/inventory/excel`, { params, responseType: 'blob' })
  }
}
