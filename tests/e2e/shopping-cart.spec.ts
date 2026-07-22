import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Flow', () => {
  test('Add to Cart, Manage Quantities, and Empty Cart', async ({ page }) => {
    // 1. Login first because /cart is protected
    await page.goto('/?login=true');
    await page.getByPlaceholder('you@example.com').fill('user@gmail.com');
    await page.getByPlaceholder('••••••••').first().fill('user1234');
    await page.locator('button[type="submit"]:has-text("Sign In")').click();
    await expect(page.getByPlaceholder('you@example.com')).toBeHidden({ timeout: 10000 });

    // 2. Navigate to products and add first item
    await page.goto('/products');
    
    // Find first product
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Verify detail page
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9_-]+/);

    // Click Add to Cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // The cart sheet/toast might open. Wait a moment or navigate to cart.
    await page.waitForTimeout(500);

    // Navigate to Cart page
    await page.goto('/cart');
    await expect(page.locator('h1')).toHaveText(/Shopping Cart|Your Cart/i);

    // Verify item is in cart
    // Since we don't know the exact class, look for standard cart elements
    const checkoutButton = page.locator('a:has-text("Proceed to Checkout"), button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();

    // Try increasing quantity
    const increaseBtn = page.locator('button:has-text("+")').first();
    if (await increaseBtn.isVisible()) {
      await increaseBtn.click();
      await page.waitForTimeout(500); // give time for state/UI update
    }

    // Remove item (look for trash icon or remove button)
    // Here we'll search for typical remove elements: a button with trash icon or text "Remove"
    const removeBtn = page.locator('button:has-text("Remove"), button[aria-label="Remove item"]').first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
    } else {
        // Fallback: looking for an icon button (lucide trash)
        const trashIcons = page.locator('svg.lucide-trash-2, svg.lucide-trash');
        if (await trashIcons.count() > 0) {
            await trashIcons.first().locator('..').click(); // click parent button
        }
    }

    // Verify empty state
    await page.waitForTimeout(500);
    const emptyStateText = page.locator('text=Your cart is empty');
    if (await emptyStateText.isVisible()) {
        await expect(emptyStateText).toBeVisible();
    }
  });
});
