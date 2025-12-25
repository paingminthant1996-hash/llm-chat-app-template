import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Azone.store/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Production-Ready');
    
    // Check navigation links
    await expect(page.locator('a[href="/templates"]')).toBeVisible();
    await expect(page.locator('a[href="/case-studies"]')).toBeVisible();
  });

  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/templates"]');
    
    await expect(page).toHaveURL(/.*templates/);
    await expect(page).toHaveTitle(/Templates/);
  });

  test('should display featured templates section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for templates to load
    await page.waitForSelector('text=Production Templates', { timeout: 10000 });
    
    // Check if templates section is visible
    const templatesSection = page.locator('text=Production Templates');
    await expect(templatesSection).toBeVisible();
  });
});

