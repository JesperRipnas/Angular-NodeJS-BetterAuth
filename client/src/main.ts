import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(appRoutes),
  ],
});
