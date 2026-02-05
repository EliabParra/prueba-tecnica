import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { AlertsService } from '../services/alerts.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private alertsService: AlertsService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken()
    if (!token) return next.handle(req)

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const validationMessage = this.buildValidationMessage(error.error?.errors)
        const serverMessage =
          (typeof error.error === 'string' ? error.error : null)
          || error.error?.body?.message
          || validationMessage
          || error.error?.message
          || error.error?.title
        const message = serverMessage || error.message
        this.alertsService.showAlert({
          type: 'error',
          title: 'Error',
          message
        })
        if (error.status === 401) {
          this.authService.logout()
        }
        return throwError(error)
      })
    )
  }

  private buildValidationMessage(errors: any): string | null {
    if (!errors || typeof errors !== 'object') return null
    const messages: string[] = []
    Object.keys(errors).forEach(key => {
      const value = errors[key]
      if (Array.isArray(value)) {
        value.filter(Boolean).forEach((msg: string) => messages.push(msg))
      } else if (typeof value === 'string') {
        messages.push(value)
      }
    })
    return messages.length ? messages.join('\n') : null
  }
}
