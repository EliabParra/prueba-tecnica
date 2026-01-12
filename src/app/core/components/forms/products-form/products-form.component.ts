import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../interfaces/Product';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product
  ) { }

  ngOnInit(): void {}

  productsForm = this.fb.group({
    name: [this.data.name, Validators.required],
    category: [this.data.category, Validators.required]
  })

  get name(): AbstractControl {
    return this.productsForm.get('name');
  }

  get category(): AbstractControl {
    return this.productsForm.get('category');
  }

  onSubmit() {
    const product: Product = {
      id: this.data?.id,
      name: this.name.value,
      category: this.category.value
    };
    this.dialogRef.close(product);
  }
}
