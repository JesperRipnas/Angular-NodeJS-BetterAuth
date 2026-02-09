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
      this.usernameStatus.set('idle');
      this.emailStatus.set('idle');
    }
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
    this.updateField('username', value as AuthUser['username']);
    this.scheduleUsernameValidation(value);
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

  private isEmailValid(value: string | null | undefined): boolean {
    const normalized = value?.trim() ?? '';
    if (!normalized) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }
}
