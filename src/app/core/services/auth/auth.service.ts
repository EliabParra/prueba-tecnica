import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginRequestDTO, AuthResponseDTO } from '../../interfaces/api/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token'
  private readonly baseUrl = `${environment.apiUrl}/api/auth`

  private authSubject = new BehaviorSubject<boolean>(this.hasToken())
  public isAuthenticated$ = this.authSubject.asObservable()

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey)
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  isAuthenticated(): boolean {
    return this.hasToken()
  }

  async login(username: string, password: string): Promise<boolean> {
    const payload: LoginRequestDTO = { username, password }
    const result = await this.http.post<AuthResponseDTO>(`${this.baseUrl}/login`, payload).toPromise()
    const token = result?.token || null
    if (token) {
      localStorage.setItem(this.tokenKey, token)
      this.authSubject.next(true)
      return true
    }
    return false
  }

  logout() {
    localStorage.removeItem(this.tokenKey)
    this.authSubject.next(false)
    this.router.navigate(['/login'])
  }
}
