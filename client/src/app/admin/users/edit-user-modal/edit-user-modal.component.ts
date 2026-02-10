import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthUser } from '../../../auth/models/auth-user.model';
import { Role } from '../../../auth/models/role.enum';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.css'],
})
export class EditUserModalComponent implements OnChanges, OnDestroy {
  isModalValid(): boolean {
    return (
      this.usernameStatus() === 'valid' &&
      this.emailStatus() === 'valid' &&
      this.firstNameStatus() === 'valid' &&
      this.lastNameStatus() === 'valid'
    );
  }
  user = input<AuthUser | null>(null);
  adminCount = input<number>(0);
  existingUsers = input<AuthUser[]>([]);
  closeModal = output<void>();
  saveUser = output<AuthUser>();

  protected readonly translation = inject(TranslationService);
  formData = signal<Partial<AuthUser> | null>(null);
  usernameStatus = signal<'idle' | 'valid' | 'invalid'>('idle');
  emailStatus = signal<'idle' | 'valid' | 'invalid'>('idle');
  readonly Role = Role;
  private usernameDebounceId: number | null = null;
  private emailDebounceId: number | null = null;

  isLastAdmin = computed(() => {
    const currentUser = this.user();
    return currentUser?.role === Role.ADMIN && this.adminCount() === 1;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user()) {
      this.formData.set({ ...this.user() });
      // run initial validation for all fields when modal opens
      this.clearDebounces();
      this.validateAllFields();
    }
  }

  private clearDebounces(): void {
    if (this.usernameDebounceId !== null) {
      window.clearTimeout(this.usernameDebounceId);
      this.usernameDebounceId = null;
    }
    if (this.emailDebounceId !== null) {
      window.clearTimeout(this.emailDebounceId);
      this.emailDebounceId = null;
    }
  }

  private validateAllFields(): void {
    const data = this.formData();
    if (!data) return;

    // Username
    const username = data.username ?? '';
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!username || !usernamePattern.test(username.trim())) {
      this.usernameStatus.set('invalid');
    } else {
      this.usernameStatus.set(
        this.isUsernameAvailable(username) ? 'valid' : 'invalid'
      );
    }

    // Email
    const email = data.email ?? '';
    this.emailStatus.set(this.isEmailValid(email) ? 'valid' : 'invalid');

    // First name
    const firstName = data.firstName ?? '';
    this.firstNameStatus.set(this.isNameValid(firstName) ? 'valid' : 'invalid');

    // Last name
    const lastName = data.lastName ?? '';
    this.lastNameStatus.set(this.isNameValid(lastName) ? 'valid' : 'invalid');
  }

  ngOnDestroy(): void {
    if (this.usernameDebounceId !== null) {
      window.clearTimeout(this.usernameDebounceId);
    }
    if (this.emailDebounceId !== null) {
      window.clearTimeout(this.emailDebounceId);
    }
  }

  onSave(): void {
    const data = this.formData();
    if (data) {
      this.saveUser.emit(data as AuthUser);
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  updateField<K extends keyof Partial<AuthUser>>(
    field: K,
    value: AuthUser[K]
  ): void {
    const current = this.formData();
    if (current) {
      this.formData.set({ ...current, [field]: value });
    }
  }

  onUsernameInput(value: string): void {
    const normalized = this.capitalizeFirstLetter(value);
    this.updateField('username', normalized as AuthUser['username']);
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!normalized || !usernamePattern.test(normalized.trim())) {
      this.usernameStatus.set('invalid');
      return;
    }
    this.scheduleUsernameValidation(normalized);
  }
  // Validation signals for first/last name
  firstNameStatus = signal<'idle' | 'valid' | 'invalid'>('idle');
  lastNameStatus = signal<'idle' | 'valid' | 'invalid'>('idle');

  onFirstNameInput(value: string): void {
    const normalized = this.capitalizeFirstLetter(value);
    this.updateField('firstName', normalized as AuthUser['firstName']);
    if (!this.isNameValid(normalized)) {
      this.firstNameStatus.set('invalid');
    } else {
      this.firstNameStatus.set('valid');
    }
  }

  onLastNameInput(value: string): void {
    const normalized = this.capitalizeFirstLetter(value);
    this.updateField('lastName', normalized as AuthUser['lastName']);
    if (!this.isNameValid(normalized)) {
      this.lastNameStatus.set('invalid');
    } else {
      this.lastNameStatus.set('valid');
    }
  }

  onEmailInput(value: string): void {
    this.updateField('email', value as AuthUser['email']);
    this.scheduleEmailValidation(value);
  }

  onRoleChange(value: string): void {
    this.updateField('role', value as Role);
  }

  private scheduleUsernameValidation(value: string): void {
    if (typeof window === 'undefined') return;
    if (this.usernameDebounceId !== null) {
      window.clearTimeout(this.usernameDebounceId);
    }
    this.usernameStatus.set('idle');
    this.usernameDebounceId = window.setTimeout(() => {
      const usernamePattern = /^[a-zA-Z0-9]+$/;
      if (!value || !usernamePattern.test(value.trim())) {
        this.usernameStatus.set('invalid');
        return;
      }
      this.usernameStatus.set(
        this.isUsernameAvailable(value) ? 'valid' : 'invalid'
      );
    }, 500);
  }

  private scheduleEmailValidation(value: string): void {
    if (typeof window === 'undefined') return;
    if (this.emailDebounceId !== null) {
      window.clearTimeout(this.emailDebounceId);
    }
    this.emailStatus.set('idle');
    this.emailDebounceId = window.setTimeout(() => {
      this.emailStatus.set(this.isEmailValid(value) ? 'valid' : 'invalid');
    }, 500);
  }

  private isUsernameAvailable(value: string): boolean {
    const normalized = this.normalizeUsername(value);
    if (!normalized) return false;

    const currentUser = this.user();
    if (
      currentUser &&
      normalized === this.normalizeUsername(currentUser.username)
    ) {
      return true;
    }

    return !this.existingUsers().some(
      (user) => this.normalizeUsername(user.username) === normalized
    );
  }

  private normalizeUsername(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }

  private capitalizeFirstLetter(value: string | null | undefined): string {
    const trimmed = value?.trimStart() ?? '';
    if (!trimmed) return '';
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  }

  private isEmailValid(value: string | null | undefined): boolean {
    const normalized = value?.trim() ?? '';
    if (!normalized) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  // Validate names with Unicode-aware regex when available, and fallback to
  // a permissive Latin/accented range (includes hyphens, spaces and apostrophes)
  private isNameValid(value: string | null | undefined): boolean {
    const normalized = value?.trim() ?? '';
    if (!normalized) return false;
    try {
      const pattern = /^\p{L}[\p{L}\p{M}' -]*$/u;
      return pattern.test(normalized);
    } catch (e) {
      const fallback = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' \-]*$/;
      return fallback.test(normalized);
    }
  }
}
