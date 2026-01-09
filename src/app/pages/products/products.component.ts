import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { CreateProductComponent } from '../../core/components/forms/create-product/create-product.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
  }

  openCreateProductModal() {
    this.dialog.open(CreateProductComponent, {
      width: '40rem'
    })
  }
}
