import { test, expect } from '@playwright/test'

test.describe('Calendar Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for calendar to load
    await page.waitForSelector('.calendar-container')
  })

  test('should redirect to current month on initial load', async ({ page }) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    await expect(page).toHaveURL(new RegExp(`/${year}/${month}$`))
  })

  test('should navigate between calendar views', async ({ page }) => {
    // Start at month view
    await page.click('button:has-text("Year")')
    await expect(page).toHaveURL(/\/\d{4}$/)
    
    await page.click('button:has-text("Month")')
    await expect(page).toHaveURL(/\/\d{4}\/\d{2}$/)
    
    await page.click('button:has-text("Week")')
    await expect(page).toHaveURL(/\/\d{4}\/\d{1,2}$/)
    
    await page.click('button:has-text("Day")')
    await expect(page).toHaveURL(/\/\d{4}\/\d{2}\/\d{2}$/)
  })

  test('should preserve browsing date when switching views', async ({ page }) => {
    // Navigate to a specific date
    await page.goto('/2023/12/15')
    
    // Switch to year view
    await page.click('button:has-text("Year")')
    await expect(page).toHaveURL('/2023')
    
    // Switch to month view
    await page.click('button:has-text("Month")')
    await expect(page).toHaveURL('/2023/12')
    
    // Switch to week view
    await page.click('button:has-text("Week")')
    // Week 50 of 2023 contains December 15
    await expect(page).toHaveURL('/2023/50')
    
    // Switch to day view
    await page.click('button:has-text("Day")')
    await expect(page).toHaveURL('/2023/12/15')
  })

  test('should navigate with browser back/forward buttons', async ({ page }) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Navigate through different views
    await page.click('button:has-text("Year")')
    await expect(page).toHaveURL(`/${year}`)
    
    await page.click('button:has-text("Month")')
    await expect(page).toHaveURL(`/${year}/${month}`)
    
    // Go back
    await page.goBack()
    await expect(page).toHaveURL(`/${year}`)
    
    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(`/${year}/${month}`)
  })

  test('should navigate with previous/next buttons', async ({ page }) => {
    await page.goto('/2025/07/24')
    
    // Navigate to previous day
    await page.click('button[class*="btn-nav"]:first-of-type')
    await expect(page).toHaveURL('/2025/07/23')
    
    // Navigate to next day
    await page.click('button[class*="btn-nav"]:last-of-type')
    await page.click('button[class*="btn-nav"]:last-of-type')
    await expect(page).toHaveURL('/2025/07/25')
  })

  test('should handle Today button correctly', async ({ page }) => {
    // Navigate to a different date
    await page.goto('/2023/12/15')
    
    // Click Today button
    await page.click('button:has-text("Today")')
    
    // Should navigate to current date in the same view (day view)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    await expect(page).toHaveURL(`/${year}/${month}/${day}`)
  })

  test('should handle direct URL access', async ({ page }) => {
    // Test year view
    await page.goto('/2024')
    await expect(page).toHaveURL('/2024')
    await expect(page.locator('.current-period')).toHaveText('2024')
    
    // Test month view
    await page.goto('/2024/06')
    await expect(page).toHaveURL('/2024/06')
    await expect(page.locator('.current-period')).toContainText('June 2024')
    
    // Test week view
    await page.goto('/2024/25')
    await expect(page).toHaveURL('/2024/25')
    
    // Test day view
    await page.goto('/2024/06/15')
    await expect(page).toHaveURL('/2024/06/15')
    await expect(page.locator('.current-period')).toContainText('June 15, 2024')
  })

  test('should update view buttons based on current route', async ({ page }) => {
    // Navigate to year view
    await page.goto('/2024')
    await expect(page.locator('.btn-view.active')).toHaveText('Year')
    
    // Navigate to month view
    await page.goto('/2024/06')
    await expect(page.locator('.btn-view.active')).toHaveText('Month')
    
    // Navigate to week view
    await page.goto('/2024/25')
    await expect(page.locator('.btn-view.active')).toHaveText('Week')
    
    // Navigate to day view
    await page.goto('/2024/06/15')
    await expect(page.locator('.btn-view.active')).toHaveText('Day')
  })
})