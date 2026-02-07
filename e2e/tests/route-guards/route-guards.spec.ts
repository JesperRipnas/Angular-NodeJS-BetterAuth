import { test, expect } from '@playwright/test';
import { grantCookieConsent, login, users } from '../../support/auth';

test.beforeEach(async ({ page }) => {
  await grantCookieConsent(page);
});

test('unauthenticated user cannot access protected routes', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/$/);
});

test('user can access dashboard/profile', async ({ page }) => {
  await login(page, users.user);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);
});

test('seller can access dashboard/profile', async ({ page }) => {
  await login(page, users.seller);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);
});

test('admin can access dashboard/profile and admin users', async ({ page }) => {
  await login(page, users.admin);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/admin\/users$/);
});
