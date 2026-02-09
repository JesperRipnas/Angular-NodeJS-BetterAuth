import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, EditUserModalComponent, PaginatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  protected readonly translation = inject(TranslationService);
  private readonly pageSizeStorageKey = 'admin.users.pageSize';
  private readonly filtersStorageKey = 'admin.users.filters';

  users = signal<AuthUser[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedUserForEdit = signal<AuthUser | null>(null);
  isSaving = signal(false);
  showFilters = signal(false);
  searchTerm = signal('');
  selectedRoles = signal<Role[]>([Role.ADMIN, Role.SELLER, Role.USER]);
  selectedVerification = signal<('verified' | 'unverified')[]>([
    'verified',
    'unverified',
  ]);
  pageIndex = signal(1);
  pageSize = signal(5);
  readonly pageSizeOptions = [5, 10, 15, 20];
  sortKey = signal<
    | 'username'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'createdAt'
    | 'updatedAt'
    | 'verifiedEmail'
    | 'role'
    | null
  >('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

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
      selectedRoles.length === this.roleOptions.length &&
      selectedVerification.length === 0
    ) {
      return this.users();
    }

    return this.users().filter((user) => {
      const username = user.username?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      const matchesQuery = username.includes(query) || email.includes(query);
      const matchesRole = selectedRoles.includes(user.role);
      const matchesVerification =
        selectedVerification.length === 0 ||
        (user.verifiedEmail
          ? selectedVerification.includes('verified')
          : selectedVerification.includes('unverified'));
      return matchesQuery && matchesRole && matchesVerification;
    });
  });

  readonly pagedUsers = computed(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.sortedUsers().slice(start, start + this.pageSize());
  });

  readonly sortedUsers = computed(() => {
    const key = this.sortKey();
    if (!key) return this.filteredUsers();

    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.filteredUsers()].sort((a, b) => {
      const valueA = this.getSortableValue(a, key);
      const valueB = this.getSortableValue(b, key);
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  });

  readonly isAllRolesSelected = computed(
    () => this.selectedRoles().length === this.roleOptions.length
  );

  private readonly paginationGuard = effect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredUsers().length / this.pageSize())
    );
    if (this.pageIndex() > totalPages) {
      this.pageIndex.set(totalPages);
    }
  });

  ngOnInit(): void {
    this.restorePageSize();
    this.restoreFilters();
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
    this.pageIndex.set(1);
    this.persistFilters();
  }

  toggleAllRoles(checked: boolean): void {
    if (checked) {
      this.selectedRoles.set(this.roleOptions.map((option) => option.value));
      this.pageIndex.set(1);
      this.persistFilters();
      return;
    }

    const fallbackRole = this.roleOptions[0]?.value ?? Role.USER;
    this.selectedRoles.set([fallbackRole]);
    this.pageIndex.set(1);
    this.persistFilters();
  }

  toggleRole(role: Role, checked: boolean): void {
    this.selectedRoles.update((roles) => {
      if (checked) {
        return roles.includes(role) ? roles : [...roles, role];
      }

      const remaining = roles.filter((value) => value !== role);
      return remaining.length === 0 ? roles : remaining;
    });
    this.pageIndex.set(1);
    this.persistFilters();
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
    this.pageIndex.set(1);
    this.persistFilters();
  }

  isVerificationSelected(value: 'verified' | 'unverified'): boolean {
    return this.selectedVerification().includes(value);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
  }

  toggleSort(key: Exclude<ReturnType<typeof this.sortKey>, null>): void {
    if (this.sortKey() === key) {
      this.sortDirection.update((direction) =>
        direction === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  getSortIndicator(
    key: Exclude<ReturnType<typeof this.sortKey>, null>
  ): string {
    if (this.sortKey() !== key) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }

  getAriaSort(
    key: Exclude<ReturnType<typeof this.sortKey>, null>
  ): 'none' | 'ascending' | 'descending' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  }

  private getSortableValue(
    user: AuthUser,
    key: Exclude<ReturnType<typeof this.sortKey>, null>
  ): string | number {
    switch (key) {
      case 'createdAt':
      case 'updatedAt': {
        const dateValue = Date.parse(user[key] ?? '');
        return Number.isNaN(dateValue) ? 0 : dateValue;
      }
      case 'verifiedEmail':
        return user.verifiedEmail ? 1 : 0;
      default:
        return String(user[key] ?? '').toLowerCase();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.persistPageSize(size);
  }

  private restorePageSize(): void {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(this.pageSizeStorageKey);
    if (!stored) return;
    const parsed = Number.parseInt(stored, 10);
    if (Number.isNaN(parsed)) return;
    if (!this.pageSizeOptions.includes(parsed)) return;
    this.pageSize.set(parsed);
  }

  private persistPageSize(size: number): void {
    if (typeof window === 'undefined') return;
    if (!this.pageSizeOptions.includes(size)) return;
    window.localStorage.setItem(this.pageSizeStorageKey, String(size));
  }

  private restoreFilters(): void {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(this.filtersStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as {
        searchTerm?: string;
        selectedRoles?: Role[];
        selectedVerification?: ('verified' | 'unverified')[];
      };

      if (typeof parsed.searchTerm === 'string') {
        this.searchTerm.set(parsed.searchTerm);
      }

      if (Array.isArray(parsed.selectedRoles)) {
        const allowedRoles = new Set(
          this.roleOptions.map((option) => option.value)
        );
        const roles = parsed.selectedRoles.filter((role) =>
          allowedRoles.has(role)
        );
        if (roles.length > 0) {
          this.selectedRoles.set(roles);
        }
      }

      if (Array.isArray(parsed.selectedVerification)) {
        const allowedVerification: Array<'verified' | 'unverified'> = [
          'verified',
          'unverified',
        ];
        const verification = parsed.selectedVerification.filter((value) =>
          allowedVerification.includes(value)
        );
        this.selectedVerification.set(verification);
      }
    } catch {
      return;
    }
  }

  private persistFilters(): void {
    if (typeof window === 'undefined') return;
    const payload = {
      searchTerm: this.searchTerm(),
      selectedRoles: this.selectedRoles(),
      selectedVerification: this.selectedVerification(),
    };
    window.localStorage.setItem(
      this.filtersStorageKey,
      JSON.stringify(payload)
    );
  }

  isLastAdmin(user: AuthUser): boolean {
    return user.role === Role.ADMIN && this.adminCount() === 1;
  }

  saveEditedUser(updatedUser: AuthUser): void {
    const originalUser = this.selectedUserForEdit();
    if (!originalUser) return;

    const normalizedUsername = this.normalizeUsername(updatedUser.username);
    if (
      normalizedUsername &&
      this.isUsernameTaken(normalizedUsername, originalUser.uuid)
    ) {
      this.error.set(
        this.translation.translate('admin.users.messages.usernameTaken')
      );
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.usersService.updateUser(originalUser.uuid, updatedUser).subscribe({
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

  deleteUser(uuid: string): void {
    const userToDelete = this.users().find((u) => u.uuid === uuid);
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
      this.usersService.deleteUser(uuid).subscribe({
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

  private normalizeUsername(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }

  private isUsernameTaken(
    normalizedUsername: string,
    currentUuid: string
  ): boolean {
    return this.users().some(
      (user) =>
        user.uuid !== currentUuid &&
        this.normalizeUsername(user.username) === normalizedUsername
    );
  }
}
