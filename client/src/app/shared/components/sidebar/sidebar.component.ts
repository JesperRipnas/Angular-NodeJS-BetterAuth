import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { Role } from '../../../auth/models/role.enum';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  translate?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly isVisible = computed(() => {
    const url = this.currentUrl();
    return url !== '/' && url !== '/home';
  });

  readonly userRole = computed(() => {
    const user = this.authService.getUserSignal()();
    return user?.role;
  });

  menuSections = computed<MenuSection[]>(() => {
    const role = this.userRole();

    const baseSections: MenuSection[] = [
      {
        title: '',
        items: [
          {
            label: 'sidebar.dashboard',
            icon: '📊',
            translate: true,
            route: '/dashboard',
          },
          {
            label: 'sidebar.profile',
            icon: '👤',
            translate: true,
            route: '/profile',
          },
        ],
      },
    ];

    // Add admin section if user is admin
    if (role === Role.ADMIN) {
      baseSections.push({
        title: 'Admin',
        items: [
          {
            label: 'sidebar.users',
            icon: '👥',
            translate: true,
            route: '/admin/users',
          },
        ],
      });
    }

    return baseSections;
  });

  logoutItem: MenuItem = {
    label: 'shared.logout',
    icon: '',
    translate: true,
  };

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  handleItemClick(item: MenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
