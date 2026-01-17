import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';

export interface AuthCredentials {
  username: string;
  password: string;
}

export const AUTH_CREDENTIALS = new HttpContextToken<AuthCredentials | null>(
  () => null
);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if request has credentials in context
  const credentials = req.context.get(AUTH_CREDENTIALS);

  if (credentials) {
    const encodedCredentials = btoa(
      `${credentials.username}:${credentials.password}`
    );

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    });
    return next(authReq);
  }
  return next(req);
};
