import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {

  constructor(
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Inventario')
  }

}
