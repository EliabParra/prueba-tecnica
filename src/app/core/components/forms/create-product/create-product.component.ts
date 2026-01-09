import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../../interfaces/Product';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  createProductForm = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required]
  })

  get name() {
    return this.createProductForm.get('name')
  }

  get category() {
    return this.createProductForm.get('category')
  }

  onSubmit() {
    const product: Product = {
      name: this.name.value,
      category: this.category.value
    }

    // TODO: enviar a la API
    console.log(product)
  }
}
