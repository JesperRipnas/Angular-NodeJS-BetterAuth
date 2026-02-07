import { test, expect, Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

const users = {
  admin: { username: 'admin', password: '1234' },
  user: { username: 'user', password: '1234' },
  seller: { username: 'seller', password: '1234' },
} satisfies Record<string, Credentials>;

const grantCookieConsent = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'true');
  });
};

const login = async (page: Page, credentials: Credentials): Promise<void> => {
  await page.goto('/');
  await page.locator('button.login-button').click();
  await page.locator('#email').fill(credentials.username);
  await page.locator('#password').fill(credentials.password);
  await page.locator('button.submit-btn').click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test('unauthenticated user cannot access protected routes', async ({
  page,
}) => {
  await grantCookieConsent(page);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/$/);
});

test('user can access dashboard/profile', async ({ page }) => {
  await grantCookieConsent(page);
  await login(page, users.user);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);
});

test('seller can access dashboard/profile', async ({ page }) => {
  await grantCookieConsent(page);
  await login(page, users.seller);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);
});

test('admin can access dashboard/profile and admin users', async ({ page }) => {
  await grantCookieConsent(page);
  await login(page, users.admin);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/admin\/users$/);
});
