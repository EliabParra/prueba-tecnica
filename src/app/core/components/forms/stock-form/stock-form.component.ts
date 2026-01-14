import { Component, OnInit, Inject } from '@angular/core'
import { FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { StockDisplay, Stock } from '../../../interfaces/Stock';
import { StoresService } from '../../../services/stores.service';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../interfaces/Product';
import { Store } from '../../../interfaces/Store';
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
    private storesService: StoresService,
    public dialogRef: MatDialogRef<StockFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.productsService.products$.subscribe(list => {
      this.products = list
    })
    this.storesService.stores$.subscribe(list => {
      this.stores = list
    })
    this.filteredProducts = this.product.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    )
    this.filteredStores = this.store.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStores(value || ''))
    )
    this.filteredProducts.subscribe(list => this.filteredProductsArray = list)
    this.filteredStores.subscribe(list => this.filteredStoresArray = list)
  }

  products: Product[] = []
  stores: Store[] = []
  filteredProducts: Observable<string[]>
  filteredStores: Observable<string[]>
  filteredProductsArray: string[] = []
  filteredStoresArray: string[] = []

  stocksForm = this.fb.group({
    product: [this.data.product.name, Validators.required],
    store: [this.data.store.name, Validators.required],
    quantity: [this.data.quantity, [Validators.required, Validators.min(0)]]
  })

  get product(): AbstractControl {
    return this.stocksForm.get('product')
  }

  get store(): AbstractControl {
    return this.stocksForm.get('store')
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

  private _filterStores(value: string): string[] {
    const filterValue = value.toLowerCase()
    return this.stores
      .map(store => store.name)
      .filter(storeName => storeName.toLowerCase().includes(filterValue))
  }

  onSubmit() {
    const stockDisplay: StockDisplay = {
      product: this.products.find(p => p.name === this.product.value),
      store: this.stores.find(s => s.name === this.store.value),
      quantity: this.quantity.value
    }
    this.dialogRef.close(stockDisplay)
  }

}
