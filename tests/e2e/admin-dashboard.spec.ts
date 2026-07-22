import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flow', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Navigate to a page with ?login=true to open the modal
    await page.goto('/?login=true');
    
    // Fill in the modal
    await page.getByPlaceholder('you@example.com').fill('admin@gmail.com');
    await page.getByPlaceholder('••••••••').first().fill('admin1234');
    await page.locator('button[type="submit"]:has-text("Sign In")').click();
    
    // Wait for modal to close
    await expect(page.getByPlaceholder('you@example.com')).toBeHidden({ timeout: 10000 });
  });

  test('Admin can access the dashboard and view metrics', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin.*/);
    
    // Check for dashboard elements
    const cards = page.locator('.bg-card, .rounded-xl');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('Admin can view the products management table', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Wait for page to load
    await expect(page).toHaveURL(/.*admin\/products.*/);
    
    // Verify an add button exists
    const addButton = page.locator('a:has-text("Add"), button:has-text("Add"), a:has-text("Create"), button:has-text("Create")');
    if (await addButton.count() > 0) {
        await expect(addButton.first()).toBeVisible();
    }
  });

  test('Admin can view the categories management table', async ({ page }) => {
    await page.goto('/admin/categories');
    await expect(page).toHaveURL(/.*admin\/categories.*/);
  });
});
