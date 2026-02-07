import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, tap, catchError, finalize } from 'rxjs';
import { AuthUser } from '../../auth/models/auth-user.model';
import { AuthCookie } from '../../auth/models/auth-cookie.model';
import { environment } from '../../../environments/environment';
import { AUTH_CREDENTIALS } from '../interceptors/auth.interceptor';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly COOKIE_NAME = 'auth_session';
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
  private readonly CONSENT_KEY = 'cookie_consent';
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private readonly http = inject(HttpClient);

  private readonly _isLoggedIn = signal(false);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  constructor() {
    this.restoreSession();
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  setLoggedIn(value: boolean): void {
    this._isLoggedIn.set(value);
    if (!value) {
      this._user.set(null);
      this.clearCookie();
    } else {
      this.saveToCookie();
    }
  }

  getUser(): AuthUser | null {
    return this._user();
  }

  getUserSignal() {
    return this._user;
  }

  setUser(user: AuthUser): void {
    this._user.set(user);
    this.saveToCookie();
  }

  isLoading(): boolean {
    return this._isLoading();
  }

  error(): string | null {
    return this._error();
  }

  clearError(): void {
    this._error.set(null);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    const context = new HttpContext().set(AUTH_CREDENTIALS, loginRequest);

    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, {}, { context })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            this.setLoggedIn(true);
            this.setUser(response.user);
          } else {
            this._error.set('auth.errors.invalidCredentials');
          }
        }),
        catchError((error) => {
          this._error.set('auth.errors.loginFailed');
          throw error;
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  signup(signupRequest: SignupRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    const context = new HttpContext().set(AUTH_CREDENTIALS, {
      username: signupRequest.username,
      password: signupRequest.password,
    });

    const signupData = {
      firstName: signupRequest.firstName,
      lastName: signupRequest.lastName,
      email: signupRequest.email,
      birthDate: signupRequest.birthDate,
      gender: signupRequest.gender,
    };

    return this.http
      .post<LoginResponse>(`${this.API_URL}/signup`, signupData, { context })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            this.setLoggedIn(true);
            this.setUser(response.user);
          } else {
            this._error.set('auth.errors.signupFailed');
          }
        }),
        catchError(() => {
          this._error.set('auth.errors.signupFailed');
          throw new Error('Signup failed');
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  logout(): void {
    this.setLoggedIn(false);
  }

  private restoreSession(): void {
    const cookieData = this.getCookie();
    if (cookieData && cookieData.expiresAt > Date.now()) {
      this._isLoggedIn.set(cookieData.isLoggedIn);
      this._user.set(cookieData.user);
    } else {
      this.clearCookie();
    }
  }

  private saveToCookie(): void {
    if (!this.hasCookieConsent()) {
      return;
    }

    // FAKE DATA FOR TESTING PURPOSES ONLY, WILL BE SESSION KEY OR TOKEN IN REAL IMPLEMENTATION
    const data: AuthCookie = {
      isLoggedIn: this._isLoggedIn(),
      user: this._user(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    const expires = new Date(data.expiresAt);
    document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(data)
    )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
  }

  private getCookie(): AuthCookie | null {
    const name = this.COOKIE_NAME + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        try {
          return JSON.parse(cookie.substring(name.length));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private clearCookie(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  }

  private hasCookieConsent(): boolean {
    return localStorage.getItem(this.CONSENT_KEY) === 'true';
  }
}
