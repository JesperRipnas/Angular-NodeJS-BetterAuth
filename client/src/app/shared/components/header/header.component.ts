import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isLoggedIn = input();
  isMenuOpen = input(false);
  loginClick = output<void>();
  profileClick = output<void>();
  menuClick = output<void>();
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  handleAuthClick(): void {
    if (this.isLoggedIn()) {
      this.profileClick.emit();
      return;
    }

    this.loginClick.emit();
  }

  handleMenuClick(): void {
    this.menuClick.emit();
  }
}
