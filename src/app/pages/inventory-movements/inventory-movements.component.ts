import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { StockService } from '../../core/services/stock.service';
import { Product } from '../../core/interfaces/Product';
import { Warehouse } from '../../core/interfaces/Warehouse';
import { MovementRequestDTO, TransferRequestDTO } from '../../core/interfaces/api/inventory';
import { NavigationService } from '../../core/services/navigation.service';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-inventory-movements',
  templateUrl: './inventory-movements.component.html',
  styleUrls: ['./inventory-movements.component.scss']
})
export class InventoryMovementsComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private stockService: StockService,
    private navigationService: NavigationService,
    private alertsService: AlertsService
  ) {}

  products: Product[] = []
  warehouses: Warehouse[] = []
  loading = false

  movementForm = this.fb.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    warehouseId: [0, [Validators.required, Validators.min(1)]],
    movementType: ['IN', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    description: ['']
  })

  transferForm = this.fb.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    sourceWarehouseId: [0, [Validators.required, Validators.min(1)]],
    targetWarehouseId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]]
  })

  get mvProductId(): AbstractControl { return this.movementForm.get('productId') }
  get mvWarehouseId(): AbstractControl { return this.movementForm.get('warehouseId') }
  get mvType(): AbstractControl { return this.movementForm.get('movementType') }
  get mvQty(): AbstractControl { return this.movementForm.get('quantity') }

  get tfProductId(): AbstractControl { return this.transferForm.get('productId') }
  get tfSourceId(): AbstractControl { return this.transferForm.get('sourceWarehouseId') }
  get tfTargetId(): AbstractControl { return this.transferForm.get('targetWarehouseId') }
  get tfQty(): AbstractControl { return this.transferForm.get('quantity') }

  ngOnInit(): void {
    this.navigationService.setTitle('Movimientos')
    this.productsService.products$.subscribe(list => this.products = list)
    this.warehousesService.warehouses$.subscribe(list => this.warehouses = list)
  }

  loadProducts(opened: boolean) {
    if (opened) this.productsService.syncDB().then()
  }

  loadWarehouses(opened: boolean) {
    if (opened) this.warehousesService.syncDB().then()
  }

  async submitMovement() {
    if (this.movementForm.invalid || this.loading) return
    this.loading = true
    try {
      const payload: MovementRequestDTO = {
        productId: Number(this.mvProductId.value),
        warehouseId: Number(this.mvWarehouseId.value),
        movementType: this.mvType.value,
        quantity: Number(this.mvQty.value),
        description: this.movementForm.get('description').value || null
      }
      await this.stockService.createMovement(payload)
      this.alertsService.showAlert({ type: 'success', title: 'Movimiento registrado', message: 'Se registró el movimiento' })
      this.movementForm.reset({ productId: 0, warehouseId: 0, movementType: 'IN', quantity: 1, description: '' })
    } catch (error) {
      const message =
        (typeof error?.error === 'string' ? error.error : null)
        || error?.error?.body?.message
        || error?.error?.message
        || error?.message
      this.alertsService.showAlert({ type: 'error', title: 'Error', message })
    } finally {
      this.loading = false
    }
  }

  async submitTransfer() {
    if (this.transferForm.invalid || this.loading) return
    if (Number(this.tfSourceId.value) === Number(this.tfTargetId.value)) {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'El almacén origen y destino deben ser distintos' })
      return
    }
    this.loading = true
    try {
      const payload: TransferRequestDTO = {
        productId: Number(this.tfProductId.value),
        sourceWarehouseId: Number(this.tfSourceId.value),
        targetWarehouseId: Number(this.tfTargetId.value),
        quantity: Number(this.tfQty.value)
      }
      await this.stockService.createTransfer(payload)
      this.alertsService.showAlert({ type: 'success', title: 'Transferencia registrada', message: 'Se registró la transferencia' })
      this.transferForm.reset({ productId: 0, sourceWarehouseId: 0, targetWarehouseId: 0, quantity: 1 })
    } catch (error) {
      const message =
        (typeof error?.error === 'string' ? error.error : null)
        || error?.error?.body?.message
        || error?.error?.message
        || error?.message
      this.alertsService.showAlert({ type: 'error', title: 'Error', message })
    } finally {
      this.loading = false
    }
  }
}
