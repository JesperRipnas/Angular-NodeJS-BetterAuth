import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
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
export class EditUserModalComponent implements OnChanges {
  user = input<AuthUser | null>(null);
  adminCount = input<number>(0);
  closeModal = output<void>();
  saveUser = output<AuthUser>();

  protected readonly translation = inject(TranslationService);
  formData = signal<Partial<AuthUser> | null>(null);
  readonly Role = Role;

  isLastAdmin = computed(() => {
    const currentUser = this.user();
    return currentUser?.role === Role.ADMIN && this.adminCount() === 1;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user()) {
      this.formData.set({ ...this.user() });
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

  onRoleChange(value: string): void {
    this.updateField('role', value as Role);
  }
}
