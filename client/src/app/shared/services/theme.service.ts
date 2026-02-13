import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal(false);
  private readonly themeVersionKey = 'themeVersion';
  private readonly themeVersion = 'v2';

  constructor() {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    const saved = localStorage.getItem('theme');
    const savedVersion = localStorage.getItem(this.themeVersionKey);
    if (savedVersion !== this.themeVersion) {
      this.isDarkMode.set(false);
      localStorage.setItem('theme', 'light');
      localStorage.setItem(this.themeVersionKey, this.themeVersion);
    } else if (saved === 'dark') {
      this.isDarkMode.set(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update((current) => !current);
  }
}
