import { test, expect, type Page } from '@playwright/test';

// Maximum allowed time for page load / rendering in ms (SLA)
const SLA_LIMIT = 3000;

// Setup a helper function to measure navigation and render time
async function measureNavigation(page: Page, url: string, description: string) {
  const start = Date.now();
  
  // Go to the page and wait for the 'load' event
  await page.goto(url, { waitUntil: 'load' });
  
  const duration = Date.now() - start;
  console.log(`[SLA TEST] ${description}: ${duration}ms`);
  
  // Assert SLA
  expect(duration, `${description} took ${duration}ms, exceeding the ${SLA_LIMIT}ms SLA.`).toBeLessThan(SLA_LIMIT);
}

test.describe('E2E SLA Performance Tests', () => {
  
  test('Public Marketplace Discovery Flow SLA', async ({ page }) => {
    // 1. Landing Page
    await measureNavigation(page, 'http://localhost:3001/', 'Landing Page Load');
    
    // 2. Marketplace Directory
    await measureNavigation(page, 'http://localhost:3001/band', 'Marketplace Directory Load');
    
    // 3. Bands/Artists Search Page
    await measureNavigation(page, 'http://localhost:3001/band/marketplace/bands', 'Bands Search Page Load');

    // 4. Venues Search Page
    await measureNavigation(page, 'http://localhost:3001/band/marketplace/venues', 'Venues Search Page Load');
  });

  test('Client Flow SLA', async ({ page }) => {
    // Navigate directly to Client Dashboard
    await measureNavigation(page, 'http://localhost:3001/band/client/dashboard', 'Client Dashboard Load');
    
    // Navigating to Client Bookings
    await measureNavigation(page, 'http://localhost:3001/band/client/bookings', 'Client Bookings Page Load');

    // Navigating to Client Reviews
    await measureNavigation(page, 'http://localhost:3001/band/client/reviews', 'Client Reviews Page Load');
  });

  test('Artist Dashboard Flow SLA', async ({ page }) => {
    await measureNavigation(page, 'http://localhost:3001/band/artist/dashboard', 'Artist Dashboard Load');
    
    // Navigating to Inbox
    await measureNavigation(page, 'http://localhost:3001/band/artist/inbox', 'Artist Inbox Page Load');

    // Navigating to Profile Edit
    await measureNavigation(page, 'http://localhost:3001/band/artist/profile', 'Artist Profile Page Load');
  });

  test('Venue Dashboard Flow SLA', async ({ page }) => {
    await measureNavigation(page, 'http://localhost:3001/band/venue/dashboard', 'Venue Dashboard Load');
    
    // Navigating to Inbox
    await measureNavigation(page, 'http://localhost:3001/band/venue/inbox', 'Venue Inbox Page Load');

    // Navigating to Profile Edit
    await measureNavigation(page, 'http://localhost:3001/band/venue/profile', 'Venue Profile Page Load');
  });

  test('1000 Concurrent User Load API SLA', async ({ request }) => {
    console.log('[SLA TEST] Simulating 1000 concurrent users...');
    const CONCURRENT_USERS = 1000;
    const start = Date.now();
    
    // Fire 1000 concurrent HTTP requests to the frontend server
    const requests = Array.from({ length: CONCURRENT_USERS }).map(() => {
      return request.get('http://localhost:3001/band/client/dashboard');
    });
    
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    
    // Verify all requests succeeded
    const failed = responses.filter(r => !r.ok());
    expect(failed.length).toBe(0);
    
    console.log(`[SLA TEST] 1000 concurrent requests completed in ${duration}ms`);
    
    // Assert that the total duration for all 1000 requests to resolve is within a reasonable SLA threshold. 
    // A strict 3000ms SLA for 1000 concurrent requests on a local dev server might fail, but this enforces the check.
    expect(duration, `1000 concurrent requests took ${duration}ms, exceeding the ${SLA_LIMIT}ms SLA.`).toBeLessThan(SLA_LIMIT);
  });
});

