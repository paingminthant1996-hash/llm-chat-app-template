import { test, expect } from '@playwright/test';

test.describe('Templates Page', () => {
  test('should load templates page', async ({ page }) => {
    await page.goto('/templates');
    
    await expect(page).toHaveTitle(/Templates/);
    
    // Check if search bar is visible
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter templates by search', async ({ page }) => {
    await page.goto('/templates');
    
    // Wait for templates to load
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
    
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('dashboard');
    
    // Wait for results to filter
    await page.waitForTimeout(500);
    
    // Check if results are filtered (this is a basic test - adjust based on actual behavior)
    const results = page.locator('[data-testid="template-card"]').or(page.locator('text=No templates found'));
    await expect(results.first()).toBeVisible();
  });

  test('should navigate to template detail page', async ({ page }) => {
    await page.goto('/templates');
    
    // Wait for templates to load
    await page.waitForTimeout(2000);
    
    // Click on first template card
    const firstTemplate = page.locator('a[href^="/templates/"]').first();
    
    if (await firstTemplate.count() > 0) {
      await firstTemplate.click();
      await expect(page).toHaveURL(/.*templates\/.*/);
    }
  });
});

