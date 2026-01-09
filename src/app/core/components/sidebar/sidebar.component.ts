import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NavigationService } from '../../services/navigation.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(
    public navigationService: NavigationService,
    private router: Router
  ) { }

  ngOnInit(): void {

  }

  navigateTo(path: string) {
    this.router.navigate([path])
  }
}
