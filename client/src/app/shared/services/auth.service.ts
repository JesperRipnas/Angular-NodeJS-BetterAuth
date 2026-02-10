import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createAuthClient } from 'better-auth/client';
import {
  Observable,
  from,
  switchMap,
  tap,
  catchError,
  finalize,
  throwError,
} from 'rxjs';
import { AuthUser } from '../../auth/models/auth-user.model';
import { Role } from '../../auth/models/role.enum';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  email: string;
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
  private readonly http = inject(HttpClient);
  private readonly authClient = createAuthClient({
    baseURL: `${environment.apiUrl}/api/auth`,
    fetchOptions: {
      credentials: 'include',
    },
  });

  private readonly _isLoggedIn = signal(false);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _initialSessionResolved = signal(false);
  private readonly _hadSessionOnInit = signal(false);

  constructor() {
    void this.restoreSession();
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  setLoggedIn(value: boolean): void {
    this._isLoggedIn.set(value);
    if (!value) {
      this._user.set(null);
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

  initialSessionResolved(): boolean {
    return this._initialSessionResolved();
  }

  hadSessionOnInit(): boolean {
    return this._hadSessionOnInit();
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http
      .post<unknown>(
        `${environment.apiUrl}/auth/login`,
        {
          identifier: loginRequest.email,
          password: loginRequest.password,
        },
        { withCredentials: true }
      )
      .pipe(
        switchMap((response) => {
          return from(this.syncSession()).pipe(
            switchMap((user) => {
              if (!user) {
                return throwError(() => new Error('Missing session user'));
              }

              return from([{ success: true, user }]);
            })
          );
        }),
        tap((response) => {
          this.setLoggedIn(true);
          this.setUser(response.user);
        }),
        catchError((error) => {
          this._error.set('auth.errors.invalidCredentials');
          return throwError(() => error);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  signup(signupRequest: SignupRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    const fullName =
      `${signupRequest.firstName} ${signupRequest.lastName}`.trim();

    const signUpPayload = {
      name: fullName,
      email: signupRequest.email,
      password: signupRequest.password,
      username: signupRequest.username,
      firstName: signupRequest.firstName,
      lastName: signupRequest.lastName,
      birthDate: signupRequest.birthDate,
      gender: signupRequest.gender,
    } as Parameters<typeof this.authClient.signUp.email>[0];

    return from(this.authClient.signUp.email(signUpPayload)).pipe(
      switchMap((response) => {
        if (response.error) {
          return throwError(() => new Error(response.error.message));
        }

        return from(this.syncSession()).pipe(
          switchMap((user) => {
            if (!user) {
              return throwError(() => new Error('Missing session user'));
            }

            return from([{ success: true, user }]);
          })
        );
      }),
      tap((response) => {
        this.setLoggedIn(true);
        this.setUser(response.user);
      }),
      catchError((error) => {
        this._error.set('auth.errors.signupFailed');
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  logout(): void {
    void this.authClient.signOut();
    this.setLoggedIn(false);
  }

  private async restoreSession(): Promise<void> {
    const user = await this.syncSession();
    this._hadSessionOnInit.set(Boolean(user));
    this._initialSessionResolved.set(true);
  }

  private async syncSession(): Promise<AuthUser | null> {
    const { data, error } = await this.authClient.getSession();
    if (error || !data?.user) {
      this._isLoggedIn.set(false);
      this._user.set(null);
      return null;
    }

    const mappedUser = this.mapUser(data.user as Record<string, unknown>);
    this._isLoggedIn.set(true);
    this._user.set(mappedUser);
    return mappedUser;
  }

  private mapUser(user: Record<string, unknown>): AuthUser {
    const name = (user['name'] as string | undefined) ?? '';
    const [firstName, ...restName] = name.split(' ').filter(Boolean);
    const lastName = restName.join(' ');

    return {
      uuid: (user['id'] as string) ?? '',
      username: (user['username'] as string) ?? (user['email'] as string) ?? '',
      email: (user['email'] as string) ?? '',
      firstName: (user['firstName'] as string) ?? firstName ?? '',
      lastName: (user['lastName'] as string) ?? lastName ?? '',
      birthDate: (user['birthDate'] as string) ?? '',
      createdAt: this.normalizeDate(user['createdAt']),
      updatedAt: this.normalizeDate(user['updatedAt']),
      verifiedEmail: (user['emailVerified'] as boolean) ?? false,
      role: (user['role'] as Role) ?? Role.USER,
    };
  }

  private normalizeDate(value: unknown): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }
}
