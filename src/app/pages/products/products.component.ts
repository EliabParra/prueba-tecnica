import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  constructor(
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
  }

}
