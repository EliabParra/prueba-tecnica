import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './core/services/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'prueba-tecnica';

  private subs: Subscription[] = []

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() && this.router.url !== '/login') {
      this.router.navigate(['/login'])
    }
    this.subs.push(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        if (!isAuth && this.router.url !== '/login') {
          this.router.navigate(['/login'])
        }
      })
    )
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe())
  }
}
