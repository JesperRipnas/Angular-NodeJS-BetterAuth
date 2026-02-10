import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { ErrorAlertComponent } from '../error-alert/error-alert.component';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-login-signup-modal',
  imports: [CommonModule, FormsModule, TranslatePipe, ErrorAlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-signup-modal.component.html',
  styleUrls: ['./login-signup-modal.component.css'],
})
export class LoginSignupModalComponent implements OnDestroy {
  translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly destroy$ = new Subject<void>();

  initialMode = input<AuthMode>('login');
  closeModal = output<void>();

  mode = signal<AuthMode>('login');
  firstName = signal('');
  lastName = signal('');
  username = signal('');
  gender = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loginError = signal('');
  emailError = signal('');
  usernameError = signal('');
  passwordError = signal('');
  usernameStatus = signal<'idle' | 'valid' | 'invalid'>('idle');
  emailStatus = signal<'idle' | 'valid' | 'invalid'>('idle');

  isLoading = computed(() => this.authService.isLoading());

  isLoginMode = computed(() => this.mode() === 'login');
  isSignupMode = computed(() => this.mode() === 'signup');

  modalTitle = computed(() =>
    this.isLoginMode()
      ? this.translationService.translate(
          'auth.login.title',
          this.translationService.language()
        )
      : this.translationService.translate(
          'auth.signup.title',
          this.translationService.language()
        )
  );
  submitButtonText = computed(() =>
    this.isLoginMode()
      ? this.translationService.translate(
          'auth.loginButton',
          this.translationService.language()
        )
      : this.translationService.translate(
          'auth.signupButton',
          this.translationService.language()
        )
  );

  isFormValid = computed(() => {
    const emailValue = this.email().trim();
    const passwordValid = this.password().trim().length > 0;

    if (this.isLoginMode()) {
      return emailValue.length > 0 && passwordValid;
    }

    const emailValid = emailValue.length > 0 && this.isValidEmail(emailValue);
    return (
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      this.username().trim().length > 0 &&
      this.usernameStatus() !== 'invalid' &&
      this.gender().trim().length > 0 &&
      emailValid &&
      this.emailStatus() !== 'invalid' &&
      this.password().trim().length > 5 &&
      this.password() === this.confirmPassword()
    );
  });

  passwordsMatch = computed(() => {
    if (this.confirmPassword().length === 0) return true;
    return this.password() === this.confirmPassword();
  });

  constructor() {
    this.mode.set(this.initialMode());
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private capitalizeFirstLetter(value: string): string {
    const trimmed = value.trimStart();
    if (!trimmed) return '';
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  }

  private scheduleUsernameCheck(value: string): void {
    if (typeof window === 'undefined') return;
    if (!this.isSignupMode()) {
      this.usernameError.set('');
      this.usernameStatus.set('idle');
      return;
    }

    const normalized = value.trim();
    if (!normalized) {
      this.usernameError.set('');
      this.usernameStatus.set('idle');
      return;
    }

    this.usernameError.set('');
    this.usernameStatus.set('idle');
  }

  private scheduleEmailCheck(value: string): void {
    if (typeof window === 'undefined') return;
    if (!this.isSignupMode()) {
      this.emailStatus.set('idle');
      return;
    }

    const normalized = value.trim();
    if (!normalized) {
      this.emailStatus.set('idle');
      return;
    }

    this.emailError.set('');
    this.emailStatus.set('idle');
  }

  validateEmail(): void {
    this.loginError.set('');
    const emailValue = this.email().trim();
    if (emailValue.length === 0) {
      this.emailError.set('');
      this.emailStatus.set('idle');
    } else if (this.isSignupMode() && !this.isValidEmail(emailValue)) {
      this.emailError.set('auth.errors.invalidEmail');
      this.emailStatus.set('invalid');
    } else if (this.isSignupMode()) {
      this.emailError.set('');
      this.emailStatus.set('idle');
      this.scheduleEmailCheck(emailValue);
    } else {
      this.emailError.set('');
      this.emailStatus.set('idle');
    }
  }

  onPasswordInput(): void {
    this.loginError.set('');
    if (!this.isSignupMode()) {
      this.passwordError.set('');
      return;
    }

    const length = this.password().trim().length;
    if (length === 0) {
      this.passwordError.set('');
    } else if (length < 6) {
      this.passwordError.set('auth.errors.passwordTooShort');
    } else {
      this.passwordError.set('');
    }
  }

  onFirstNameInput(value: string): void {
    this.firstName.set(this.capitalizeFirstLetter(value));
  }

  onLastNameInput(value: string): void {
    this.lastName.set(this.capitalizeFirstLetter(value));
  }

  onUsernameInput(value: string): void {
    this.username.set(this.capitalizeFirstLetter(value));
    this.scheduleUsernameCheck(this.username());
  }

  validateUsername(): void {
    this.scheduleUsernameCheck(this.username());
  }

  switchMode(): void {
    this.mode.set(this.isLoginMode() ? 'signup' : 'login');
    this.loginError.set('');
    this.usernameStatus.set('idle');
    this.emailStatus.set('idle');
    this.clearfields();
  }

  clearfields(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.username.set('');
    this.gender.set('');
    this.email.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.emailError.set('');
    this.usernameError.set('');
    this.loginError.set('');
    this.passwordError.set('');
    this.usernameStatus.set('idle');
    this.emailStatus.set('idle');
  }

  async onSubmit(): Promise<void> {
    if (this.isFormValid()) {
      if (this.isLoginMode()) {
        const email = this.email().trim();
        const password = this.password().trim();

        this.authService
          .login({ email, password })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loginError.set('');
              this.closeModal.emit();
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              this.email.set('');
              this.password.set('');
              this.loginError.set(
                this.authService.error() || 'auth.errors.invalidCredentials'
              );
            },
          });
      } else {
        const emailValue = this.email().trim();
        if (!this.isValidEmail(emailValue)) {
          this.emailError.set('auth.errors.invalidEmail');
          this.emailStatus.set('invalid');
          return;
        }

        if (this.password().trim().length < 6) {
          this.passwordError.set('auth.errors.passwordTooShort');
          return;
        }

        forkJoin({
          username: this.usersService.checkUsername(this.username().trim()),
          email: this.usersService.checkEmail(emailValue),
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: ({ username, email }) => {
              this.usernameStatus.set(username.available ? 'valid' : 'invalid');
              this.emailStatus.set(email.available ? 'valid' : 'invalid');

              if (!username.available || !email.available) {
                this.password.set('');
                this.confirmPassword.set('');
                return;
              }

              this.authService
                .signup({
                  firstName: this.firstName(),
                  lastName: this.lastName(),
                  username: this.username(),
                  email: emailValue,
                  password: this.password(),
                  birthDate: '',
                  gender: this.gender(),
                })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.loginError.set('');
                    this.closeModal.emit();
                    this.router.navigate(['/dashboard']);
                  },
                  error: () => {
                    this.loginError.set(
                      this.authService.error() || 'auth.errors.signupFailed'
                    );
                  },
                });
            },
            error: () => {
              this.usernameStatus.set('invalid');
              this.emailStatus.set('invalid');
              this.password.set('');
              this.confirmPassword.set('');
            },
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loginWithGoogle(): void {
    console.log(`${this.mode()} with Google`);
    // TODO: implement Google OAuth flow
  }

  loginWithFacebook(): void {
    console.log(`${this.mode()} with Facebook`);
    // TODO: implement Facebook OAuth flow
  }
}
