import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully and displays products', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check if the main heading is visible (assuming it says "Featured Products" or similar)
    // Adjust this based on actual homepage content
    await expect(page.locator('h1')).toBeVisible();

    // Check that at least one product card is rendered
    // Product cards have an 'Add to Cart' button or a link to the product
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible();
    
    // Check if categories are rendered (if applicable)
    const categoryFilter = page.locator('text=All Categories');
    if (await categoryFilter.isVisible()) {
        await expect(categoryFilter).toBeVisible();
    }
  });

  test('can navigate to a product detail page', async ({ page }) => {
    await page.goto('/');
    
    // Find the first product link and click it
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Verify the URL changed to a product page
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);
    
    // Verify the "Add to Cart" button exists on the product page
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });
});
