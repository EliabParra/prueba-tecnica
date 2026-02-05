import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../interfaces/Product';
import { CategoriesService } from '../../../services/categories.service';
import { Category } from '../../../interfaces/Category';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    public dialogRef: MatDialogRef<ProductsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product
  ) { }

  ngOnInit(): void {
    this.categoriesService.syncDB().then()
    this.categoriesService.categories$.subscribe(list => {
      this.categories = list
    })
  }

  loadCategories(opened: boolean) {
    if (opened) this.categoriesService.syncDB().then()
  }

  categories: Category[] = []

  private readonly namePattern = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-_.]{2,100}$/
  private readonly unitPattern = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-_.]{1,50}$/

  productsForm = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.pattern(this.namePattern)]],
    description: [this.data?.description ?? ''],
    price: [this.data?.price ?? 0, [Validators.required, Validators.min(0.01)]],
    unitOfMeasure: [this.data?.unitOfMeasure ?? '', [Validators.required, Validators.pattern(this.unitPattern)]],
    minStock: [this.data?.minStock ?? 0, [Validators.min(0)]],
    categoryId: [this.data?.categoryId ?? 0, [Validators.required, Validators.min(1)]]
  })

  get name(): AbstractControl {
    return this.productsForm.get('name');
  }

  get description(): AbstractControl { return this.productsForm.get('description'); }
  get price(): AbstractControl { return this.productsForm.get('price'); }
  get unitOfMeasure(): AbstractControl { return this.productsForm.get('unitOfMeasure'); }
  get minStock(): AbstractControl { return this.productsForm.get('minStock'); }
  get categoryId(): AbstractControl { return this.productsForm.get('categoryId'); }

  onSubmit() {
    const product: Product = {
      id: this.data?.id,
      name: this.name.value,
      description: this.description.value,
      price: Number(this.price.value),
      unitOfMeasure: this.unitOfMeasure.value,
      minStock: Number(this.minStock.value),
      categoryId: Number(this.categoryId.value)
    };
    this.dialogRef.close(product);
  }
}
