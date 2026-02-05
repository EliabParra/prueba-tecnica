import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NavigationService } from '../../services/navigation.service'
import { AuthService } from '../../services/auth/auth.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(
    public navigationService: NavigationService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

  }

  navigateTo(path: string) {
    this.router.navigate([path])
  }

  isActive(path: string): boolean {
    const current = this.router.url || '/'
    if (!path) return current === '/' || current === ''
    return current === `/${path}` || current.startsWith(`/${path}/`)
  }

  logout() {
    this.authService.logout()
  }
}
