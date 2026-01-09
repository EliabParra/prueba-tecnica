import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {

  constructor(
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Almacenes')
  }

}
