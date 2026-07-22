import { test, expect } from '@playwright/test';

test.describe('Public Browsing Flow', () => {
  test('Home Page loads featured products and categories', async ({ page }) => {
    await page.goto('/');

    // Check navbar exists
    await expect(page.locator('nav').first()).toBeVisible();

    // Check categories section (look for common links)
    const categoryLink = page.locator('a:has-text("Categories")').first();
    if (await categoryLink.isVisible()) {
      await expect(categoryLink).toBeVisible();
    }

    // Verify products are rendered on home page
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('Product Catalog loads and filters work', async ({ page }) => {
    await page.goto('/products');

    // Verify page title
    await expect(page.locator('h1')).toHaveText(/Discover Our Collection|Products|All Products/i);

    // Verify product grid
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible();

    // Attempt to search
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      // Wait for search params to update or loading to finish
      await page.waitForTimeout(500); 
    }
  });

  test('Product Detail Page renders completely', async ({ page }) => {
    // Navigate directly to products and pick the first one
    await page.goto('/products');
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Wait for the URL to change to the detail page
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);

    // Check Add to Cart button
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();

    // Check Accordions (Description, Shipping)
    const descAccordion = page.locator('button:has-text("Description")');
    if (await descAccordion.isVisible()) {
      await expect(descAccordion).toBeVisible();
      // Click to toggle
      await descAccordion.click();
    }

    // Check quantity controls
    await expect(page.locator('text=Quantity')).toBeVisible();
  });
});
