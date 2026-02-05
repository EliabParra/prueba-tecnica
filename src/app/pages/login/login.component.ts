import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertsService: AlertsService
  ) {}

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  get username(): AbstractControl { return this.loginForm.get('username') }
  get password(): AbstractControl { return this.loginForm.get('password') }

  async onSubmit() {
    if (this.loginForm.invalid || this.loading) return
    this.loading = true
    try {
      const ok = await this.authService.login(this.username.value, this.password.value)
      if (ok) {
        this.router.navigate(['/'])
      } else {
        this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'Credenciales inválidas' })
      }
    } catch {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'No se pudo iniciar sesión' })
    } finally {
      this.loading = false
    }
  }
}
