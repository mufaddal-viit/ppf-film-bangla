import { expect, test } from '@playwright/test';

test.describe('homepage', () => {
  test('renders in English, left to right', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-section="servicesGrid"]')).toBeVisible();
  });

  test('renders in Arabic, right to left', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('redirects the bare domain to a locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(en|ar)$/);
  });
});

test('submits the contact form end to end', async ({ page }) => {
  await page.goto('/en/contact');
  const form = page.locator('form.c-lead-form');

  await form.getByLabel('Full name').fill('Playwright Test');
  await form.getByLabel('Mobile number').fill('050 123 4567');
  await form.getByLabel('Message').fill('Smoke test enquiry, please ignore.');
  await form.getByRole('checkbox').check();

  const submit = form.getByRole('button', { name: 'Send message' });
  // Enabled once the Turnstile widget (Cloudflare test key: always passes) returns a token.
  await expect(submit).toBeEnabled({ timeout: 20_000 });
  await submit.click();

  await expect(page.getByRole('status')).toContainText('Thank you', { timeout: 15_000 });
});

test('shows field errors without submitting invalid data', async ({ page }) => {
  await page.goto('/en/contact');
  const form = page.locator('form.c-lead-form');
  await form.getByLabel('Mobile number').fill('123');
  await form.getByLabel('Full name').click();
  await expect(form.getByText('Enter a valid phone number.')).toBeVisible();
});

test.describe('admin panel', () => {
  test('sends signed-out visitors to the sign-in page', async ({ page }) => {
    for (const path of ['/admin', '/admin/leads', '/admin/users', '/admin/leads/export']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in to the admin panel');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('rejects wrong credentials without saying which part was wrong', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('not-the-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('status')).toHaveText('Email or password is incorrect.');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
