import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly user = computed(() => this.authService.getUser());

  username = computed(() => this.user()?.username ?? '—');
  email = computed(() => this.user()?.email ?? '—');
  firstName = computed(() => this.user()?.firstName ?? '—');
  lastName = computed(() => this.user()?.lastName ?? '—');
  birthDate = computed(() => this.user()?.birthDate ?? '—');
  verifiedEmail = computed(() => this.user()?.verifiedEmail ?? false);
}
