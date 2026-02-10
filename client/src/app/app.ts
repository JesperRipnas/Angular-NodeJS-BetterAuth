import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { LoginSignupModalComponent } from './shared/components/login-signup-modal/login-signup-modal.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    LoginSignupModalComponent,
    SidebarComponent,
    CookieConsentComponent,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  showAuthModal = signal(false);
  private readonly hasRedirectedOnInit = signal(false);
  isMobileMenuOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.hasRedirectedOnInit()) {
        return;
      }

      if (
        this.authService.initialSessionResolved() &&
        this.authService.hadSessionOnInit()
      ) {
        this.hasRedirectedOnInit.set(true);
        this.showAuthModal.set(false);
        if (!this.router.url.startsWith('/dashboard')) {
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  toggleAuthModal(): void {
    this.showAuthModal.update((value) => !value);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  goToProfile(): void {
    this.showAuthModal.set(false);
    this.router.navigate(['/profile']);
  }
}
