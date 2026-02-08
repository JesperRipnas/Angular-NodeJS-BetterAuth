import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../shared/services/users.service';
import { AuthUser } from '../../auth/models/auth-user.model';
import { EditUserModalComponent } from './edit-user-modal/edit-user-modal.component';
import { Role } from '../../auth/models/role.enum';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, EditUserModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  protected readonly translation = inject(TranslationService);

  users = signal<AuthUser[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedUserForEdit = signal<AuthUser | null>(null);
  isSaving = signal(false);
  showFilters = signal(false);
  searchTerm = signal('');
  selectedRoles = signal<Role[]>([]);
  selectedVerification = signal<('verified' | 'unverified')[]>([
    'verified',
    'unverified',
  ]);

  readonly roleOptions = [
    { value: Role.ADMIN, labelKey: 'admin.users.roles.admin' },
    { value: Role.SELLER, labelKey: 'admin.users.roles.seller' },
    { value: Role.USER, labelKey: 'admin.users.roles.user' },
  ];

  readonly verificationOptions = [
    { value: 'verified' as const, labelKey: 'admin.users.search.verified' },
    {
      value: 'unverified' as const,
      labelKey: 'admin.users.search.unverified',
    },
  ];

  readonly adminCount = computed(() => {
    return this.users().filter((user) => user.role === Role.ADMIN).length;
  });

  readonly filteredUsers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const selectedRoles = this.selectedRoles();
    const selectedVerification = this.selectedVerification();
    if (
      !query &&
      selectedRoles.length === 0 &&
      selectedVerification.length === 0
    ) {
      return this.users();
    }

    return this.users().filter((user) => {
      const username = user.username.toLowerCase();
      const email = user.email.toLowerCase();
      const matchesQuery = username.includes(query) || email.includes(query);
      const matchesRole =
        selectedRoles.length === 0 || selectedRoles.includes(user.role);
      const matchesVerification =
        selectedVerification.length === 0 ||
        (user.verifiedEmail
          ? selectedVerification.includes('verified')
          : selectedVerification.includes('unverified'));
      return matchesQuery && matchesRole && matchesVerification;
    });
  });

  readonly isAllRolesSelected = computed(
    () => this.selectedRoles().length === 0
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error.set(
          this.translation.translate('admin.users.messages.deleteError')
        );
        this.isLoading.set(false);
      },
    });
  }

  openEditModal(user: AuthUser): void {
    this.selectedUserForEdit.set(user);
  }

  closeEditModal(): void {
    this.selectedUserForEdit.set(null);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
  }

  toggleAllRoles(checked: boolean): void {
    if (checked) {
      this.selectedRoles.set([]);
      return;
    }

    this.selectedRoles.set(this.roleOptions.map((option) => option.value));
  }

  toggleRole(role: Role, checked: boolean): void {
    this.selectedRoles.update((roles) => {
      if (checked) {
        return roles.includes(role) ? roles : [...roles, role];
      }

      return roles.filter((value) => value !== role);
    });
  }

  isRoleSelected(role: Role): boolean {
    return this.selectedRoles().includes(role);
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleVerification(value: 'verified' | 'unverified', checked: boolean): void {
    this.selectedVerification.update((current) => {
      if (checked) {
        return current.includes(value) ? current : [...current, value];
      }

      return current.filter((item) => item !== value);
    });
  }

  isVerificationSelected(value: 'verified' | 'unverified'): boolean {
    return this.selectedVerification().includes(value);
  }

  isLastAdmin(user: AuthUser): boolean {
    return user.role === Role.ADMIN && this.adminCount() === 1;
  }

  saveEditedUser(updatedUser: AuthUser): void {
    const originalUser = this.selectedUserForEdit();
    if (!originalUser) return;

    this.isSaving.set(true);
    this.error.set(null);

    this.usersService.updateUser(originalUser.username, updatedUser).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error.set(
          this.translation.translate('admin.users.messages.saveError')
        );
        this.isSaving.set(false);
      },
    });
  }

  deleteUser(username: string): void {
    const userToDelete = this.users().find((u) => u.username === username);
    if (!userToDelete) return;

    if (this.isLastAdmin(userToDelete)) {
      this.error.set(
        this.translation.translate(
          'admin.users.messages.lastAdminDeleteProtection'
        )
      );
      return;
    }

    if (
      confirm(this.translation.translate('admin.users.messages.confirmDelete'))
    ) {
      this.usersService.deleteUser(username).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.error.set(
            this.translation.translate('admin.users.messages.deleteError')
          );
        },
      });
    }
  }
}
