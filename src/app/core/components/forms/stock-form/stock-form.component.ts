import { Component, OnInit, Inject } from '@angular/core'
import { FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { StockDisplay, Stock } from '../../../interfaces/Stock';
import { WarehousesService } from '../../../services/warehouses.service';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../interfaces/Product';
import { Warehouse } from '../../../interfaces/Warehouse';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-stock-form',
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss']
})
export class StockFormComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    public dialogRef: MatDialogRef<StockFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.productsService.syncDB().then()
    this.productsService.products$.subscribe(list => {
      this.products = list
      this.product.setValue(this.product.value || '', { emitEvent: true })
    })
    this.warehousesService.syncDB().then()
    this.warehousesService.warehouses$.subscribe(list => {
      this.warehouses = list
      this.warehouse.setValue(this.warehouse.value || '', { emitEvent: true })
    })
    this.filteredProducts = this.product.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    )
    this.filteredWarehouses = this.warehouse.valueChanges.pipe(
      startWith(''),
      map(value => this._filterWarehouses(value || ''))
    )
    this.filteredProducts.subscribe(list => this.filteredProductsArray = list)
    this.filteredWarehouses.subscribe(list => this.filteredWarehousesArray = list)
  }

  products: Product[] = []
  warehouses: Warehouse[] = []
  filteredProducts: Observable<string[]>
  filteredWarehouses: Observable<string[]>
  filteredProductsArray: string[] = []
  filteredWarehousesArray: string[] = []

  stocksForm = this.fb.group({
    product: [this.data?.product?.name ?? '', Validators.required],
    warehouse: [this.data?.warehouse?.name ?? '', Validators.required],
    quantity: [this.data?.quantity ?? 0, [Validators.required, Validators.min(0)]]
  })

  get product(): AbstractControl {
    return this.stocksForm.get('product')
  }

  get warehouse(): AbstractControl {
    return this.stocksForm.get('warehouse')
  }

  get quantity(): AbstractControl {
    return this.stocksForm.get('quantity')
  }

  private _filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase()
    return this.products
      .map(product => product.name)
      .filter(productName => productName.toLowerCase().includes(filterValue))
  }

  private _filterWarehouses(value: string): string[] {
    const filterValue = value.toLowerCase()
    return this.warehouses
      .map(warehouse => warehouse.name)
      .filter(warehouseName => warehouseName.toLowerCase().includes(filterValue))
  }

  onSubmit() {
    const selectedProduct = this.products.find(p => p.name === this.product.value)
    const selectedWarehouse = this.warehouses.find(s => s.name === this.warehouse.value)
    if (!selectedProduct || !selectedWarehouse) {
      return
    }
    const stockDisplay: StockDisplay = {
      product: selectedProduct,
      warehouse: selectedWarehouse,
      quantity: this.quantity.value
    }
    this.dialogRef.close(stockDisplay)
  }

}
