# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\sla-e2e.spec.ts >> E2E SLA Performance Tests >> Public Marketplace Discovery Flow SLA
- Location: tests\sla-e2e.spec.ts:22:7

# Error details

```
Error: Landing Page Load took 9743ms, exceeding the 3000ms SLA.

expect(received).toBeLessThan(expected)

Expected: < 3000
Received:   9743
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "Unify home" [ref=e7] [cursor=pointer]:
            - /url: /
            - generic [ref=e11]: Unify
          - navigation "Main" [ref=e12]:
            - link "Features" [ref=e13] [cursor=pointer]:
              - /url: /#features
            - link "Products" [ref=e14] [cursor=pointer]:
              - /url: /#products
            - link "About" [ref=e15] [cursor=pointer]:
              - /url: /#how-it-works
            - link "Contact" [ref=e16] [cursor=pointer]:
              - /url: /#contact
        - generic [ref=e17]:
          - button "Toggle theme" [ref=e18] [cursor=pointer]
          - link "Log in" [ref=e19] [cursor=pointer]:
            - /url: /login
          - link "Get started" [ref=e20] [cursor=pointer]:
            - /url: /register
    - main [ref=e21]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Premium Entertainment Marketplace
          - heading "Book the Perfect Vibe for your next event" [level=1] [ref=e27]
          - paragraph [ref=e28]: EventHub connects you with top-rated live bands, solo artists, and premium venues. Discover talent, book instantly, and pay securely with milestone protection.
          - generic [ref=e29]:
            - link "Explore Marketplace" [ref=e30] [cursor=pointer]:
              - /url: /register
            - button "Join as Artist/Venue" [ref=e31] [cursor=pointer]
          - generic [ref=e32]:
            - generic [ref=e33]:
              - term [ref=e34]: Verified Venues
              - definition [ref=e35]:
                - generic [ref=e36]: 0+
              - definition [ref=e37]: Verified Venues
            - generic [ref=e38]:
              - term [ref=e39]: Live Artists
              - definition [ref=e40]:
                - generic [ref=e41]: 0+
              - definition [ref=e42]: Live Artists
            - generic [ref=e43]:
              - term [ref=e44]: Secure Payments
              - definition [ref=e45]:
                - generic [ref=e46]: 0%
              - definition [ref=e47]: Secure Payments
        - generic [ref=e48]:
          - generic [ref=e97]:
            - paragraph [ref=e98]: The Grand Arena
            - paragraph [ref=e99]: Live Concert · Tonight
          - generic [ref=e105]:
            - paragraph [ref=e106]: Booking Confirmed
            - paragraph [ref=e107]: Advance Paid
      - generic [ref=e109]:
        - generic [ref=e110]:
          - generic [ref=e111]: Two products
          - heading "One platform, two worlds" [level=2] [ref=e112]
          - paragraph [ref=e113]: Pick the workspace that matches your passion — both are powered by the same secure, unified account.
        - generic [ref=e114]:
          - generic [ref=e138]:
            - paragraph [ref=e139]: Run your club like a pro
            - heading "Sports Management" [level=3] [ref=e140]
            - paragraph [ref=e141]: Teams, schedules, events and member management built for sports organizations of every size.
            - list [ref=e142]:
              - listitem [ref=e143]: Teams & rosters
              - listitem [ref=e147]: Events & scheduling
              - listitem [ref=e151]: Polls & messaging
              - listitem [ref=e155]: Payments & invoicing
            - link "Enter Sports" [ref=e159] [cursor=pointer]:
              - /url: /sports
          - generic [ref=e178]:
            - paragraph [ref=e179]: Book your entertainment
            - heading "EventHub Marketplace" [level=3] [ref=e180]
            - paragraph [ref=e181]: Connect with venues, artists, and live bands.
            - list [ref=e182]:
              - listitem [ref=e183]: Secure provider bookings
              - listitem [ref=e187]: Milestone payments (25/75)
              - listitem [ref=e191]: Customer & provider dashboards
              - listitem [ref=e195]: Real-time schedule management
            - link "Enter Marketplace" [ref=e199] [cursor=pointer]:
              - /url: /band
      - generic [ref=e201]:
        - generic [ref=e202]:
          - generic [ref=e203]: Everything included
          - heading "Packed with modules you'll love" [level=2] [ref=e204]
          - paragraph [ref=e205]: From scheduling training sessions to booking the next gig — every tool lives under one roof.
        - list [ref=e206]:
          - listitem [ref=e207]:
            - generic [ref=e208]: Sports Events
          - listitem [ref=e213]:
            - generic [ref=e214]: Payments
          - listitem [ref=e219]:
            - generic [ref=e220]: Messaging
          - listitem [ref=e225]:
            - generic [ref=e226]: Polls
          - listitem [ref=e231]:
            - generic [ref=e232]: Files
          - listitem [ref=e238]:
            - generic [ref=e239]: Artists
          - listitem [ref=e245]:
            - generic [ref=e246]: Bands
          - listitem [ref=e255]:
            - generic [ref=e256]: Venues
          - listitem [ref=e262]:
            - generic [ref=e263]: Bookings
          - listitem [ref=e268]:
            - generic [ref=e269]: Reviews
      - generic [ref=e275]:
        - generic [ref=e276]:
          - generic [ref=e277]: How it works
          - heading "Up and running in three steps" [level=2] [ref=e278]
          - paragraph [ref=e279]: No complexity, no clutter — a guided start that gets you productive on day one.
        - list [ref=e280]:
          - listitem [ref=e282]:
            - generic [ref=e283]: Step 1
            - generic [ref=e289]:
              - heading "Create your account" [level=3] [ref=e290]
              - paragraph [ref=e291]: Sign up in seconds with one email and password. Your identity works across every product on the platform.
          - listitem [ref=e292]:
            - generic [ref=e293]: Step 2
            - generic [ref=e302]:
              - heading "Choose your product" [level=3] [ref=e303]
              - paragraph [ref=e304]: Step into the Sports Management suite, explore the BandConnect marketplace — or use both side by side.
          - listitem [ref=e305]:
            - generic [ref=e306]: Step 3
            - generic [ref=e314]:
              - heading "Start managing" [level=3] [ref=e315]
              - paragraph [ref=e316]: Organize teams, events, payments, bookings and reviews from a dashboard designed to feel effortless.
      - generic [ref=e318]:
        - generic [ref=e319]:
          - generic [ref=e320]: Loved by teams
          - heading "What our early users say" [level=2] [ref=e321]
          - paragraph [ref=e322]: Clubs, venues, artists and managers are already building their worlds on Unify.
        - generic [ref=e323]:
          - generic [ref=e324]:
            - generic "5 out of 5 stars" [ref=e325]
            - blockquote [ref=e336]: “Scheduling, payments and team chat finally live in one place. Our admin workload dropped by half in the first month.”
            - generic [ref=e337]:
              - generic [ref=e338]: AM
              - generic [ref=e340]:
                - paragraph [ref=e341]: Alex Morgan
                - paragraph [ref=e342]: Head Coach · Strikers FC
          - generic [ref=e343]:
            - generic "5 out of 5 stars" [ref=e344]
            - blockquote [ref=e355]: “Booking bands used to mean a dozen spreadsheets. BandConnect turned it into a few clicks — with reviews we can trust.”
            - generic [ref=e356]:
              - generic [ref=e357]: PS
              - generic [ref=e359]:
                - paragraph [ref=e360]: Priya Sharma
                - paragraph [ref=e361]: Event Manager · LiveWire
          - generic [ref=e362]:
            - generic "5 out of 5 stars" [ref=e363]
            - blockquote [ref=e374]: “Our profile, availability and payments are always in sync. We landed three venue gigs in the first two weeks.”
            - generic [ref=e375]:
              - generic [ref=e376]: DK
              - generic [ref=e378]:
                - paragraph [ref=e379]: Daniel Kim
                - paragraph [ref=e380]: Manager · The Echoes
      - generic [ref=e386]:
        - heading "Ready to get started?" [level=2] [ref=e387]
        - paragraph [ref=e388]: Create your free account today and take control of your sports club in minutes.
        - link "Create free account" [ref=e390] [cursor=pointer]:
          - /url: /register
    - contentinfo [ref=e391]:
      - generic [ref=e392]:
        - generic [ref=e393]:
          - generic [ref=e394]: Unify
          - paragraph [ref=e399]: One platform powering Sports Management.
          - link "support@unify.app" [ref=e400] [cursor=pointer]:
            - /url: mailto:support@unify.app
          - generic [ref=e404]:
            - link "Instagram" [ref=e405] [cursor=pointer]:
              - /url: https://instagram.com
            - link "Facebook" [ref=e409] [cursor=pointer]:
              - /url: https://facebook.com
            - link "YouTube" [ref=e412] [cursor=pointer]:
              - /url: https://youtube.com
            - link "LinkedIn" [ref=e416] [cursor=pointer]:
              - /url: https://linkedin.com
        - generic [ref=e421]:
          - heading "Products" [level=3] [ref=e422]
          - list [ref=e423]:
            - listitem [ref=e424]:
              - link "Sports Management" [ref=e425] [cursor=pointer]:
                - /url: /sports
            - listitem [ref=e426]:
              - link "Select product" [ref=e427] [cursor=pointer]:
                - /url: /select-product
        - generic [ref=e428]:
          - heading "Company" [level=3] [ref=e429]
          - list [ref=e430]:
            - listitem [ref=e431]:
              - link "Features" [ref=e432] [cursor=pointer]:
                - /url: /#features
            - listitem [ref=e433]:
              - link "How it works" [ref=e434] [cursor=pointer]:
                - /url: /#how-it-works
            - listitem [ref=e435]:
              - link "Testimonials" [ref=e436] [cursor=pointer]:
                - /url: /#testimonials
            - listitem [ref=e437]:
              - link "Get started" [ref=e438] [cursor=pointer]:
                - /url: /register
        - generic [ref=e439]:
          - heading "Support" [level=3] [ref=e440]
          - list [ref=e441]:
            - listitem [ref=e442]:
              - link "Log in" [ref=e443] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e444]:
              - link "Verify email" [ref=e445] [cursor=pointer]:
                - /url: /verify-email
            - listitem [ref=e446]:
              - link "Reset password" [ref=e447] [cursor=pointer]:
                - /url: /forgot-password
      - paragraph [ref=e449]: © 2026 Unify. All rights reserved.
  - alert [ref=e450]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Maximum allowed time for page load / rendering in ms (SLA)
  4  | const SLA_LIMIT = 3000;
  5  | 
  6  | // Setup a helper function to measure navigation and render time
  7  | async function measureNavigation(page: any, url: string, description: string) {
  8  |   const start = Date.now();
  9  |   
  10 |   // Go to the page and wait for the 'load' event
  11 |   await page.goto(url, { waitUntil: 'load' });
  12 |   
  13 |   const duration = Date.now() - start;
  14 |   console.log(`[SLA TEST] ${description}: ${duration}ms`);
  15 |   
  16 |   // Assert SLA
> 17 |   expect(duration, `${description} took ${duration}ms, exceeding the ${SLA_LIMIT}ms SLA.`).toBeLessThan(SLA_LIMIT);
     |                                                                                            ^ Error: Landing Page Load took 9743ms, exceeding the 3000ms SLA.
  18 | }
  19 | 
  20 | test.describe('E2E SLA Performance Tests', () => {
  21 |   
  22 |   test('Public Marketplace Discovery Flow SLA', async ({ page }) => {
  23 |     // 1. Landing Page
  24 |     await measureNavigation(page, 'http://localhost:3001/', 'Landing Page Load');
  25 |     
  26 |     // 2. Marketplace Directory
  27 |     await measureNavigation(page, 'http://localhost:3001/band', 'Marketplace Directory Load');
  28 |     
  29 |     // 3. Bands/Artists Search Page
  30 |     await measureNavigation(page, 'http://localhost:3001/band/marketplace/bands', 'Bands Search Page Load');
  31 | 
  32 |     // 4. Venues Search Page
  33 |     await measureNavigation(page, 'http://localhost:3001/band/marketplace/venues', 'Venues Search Page Load');
  34 |   });
  35 | 
  36 |   test('Client Flow SLA', async ({ page }) => {
  37 |     // Navigate directly to Client Dashboard
  38 |     await measureNavigation(page, 'http://localhost:3001/band/client/dashboard', 'Client Dashboard Load');
  39 |     
  40 |     // Navigating to Client Bookings
  41 |     await measureNavigation(page, 'http://localhost:3001/band/client/bookings', 'Client Bookings Page Load');
  42 | 
  43 |     // Navigating to Client Reviews
  44 |     await measureNavigation(page, 'http://localhost:3001/band/client/reviews', 'Client Reviews Page Load');
  45 |   });
  46 | 
  47 |   test('Artist Dashboard Flow SLA', async ({ page }) => {
  48 |     await measureNavigation(page, 'http://localhost:3001/band/artist/dashboard', 'Artist Dashboard Load');
  49 |     
  50 |     // Navigating to Inbox
  51 |     await measureNavigation(page, 'http://localhost:3001/band/artist/inbox', 'Artist Inbox Page Load');
  52 | 
  53 |     // Navigating to Profile Edit
  54 |     await measureNavigation(page, 'http://localhost:3001/band/artist/profile', 'Artist Profile Page Load');
  55 |   });
  56 | 
  57 |   test('Venue Dashboard Flow SLA', async ({ page }) => {
  58 |     await measureNavigation(page, 'http://localhost:3001/band/venue/dashboard', 'Venue Dashboard Load');
  59 |     
  60 |     // Navigating to Inbox
  61 |     await measureNavigation(page, 'http://localhost:3001/band/venue/inbox', 'Venue Inbox Page Load');
  62 | 
  63 |     // Navigating to Profile Edit
  64 |     await measureNavigation(page, 'http://localhost:3001/band/venue/profile', 'Venue Profile Page Load');
  65 |   });
  66 | 
  67 |   test('1000 Concurrent User Load API SLA', async ({ request }) => {
  68 |     console.log('[SLA TEST] Simulating 1000 concurrent users...');
  69 |     const CONCURRENT_USERS = 1000;
  70 |     const start = Date.now();
  71 |     
  72 |     // Fire 1000 concurrent HTTP requests to the frontend server
  73 |     const requests = Array.from({ length: CONCURRENT_USERS }).map(() => {
  74 |       return request.get('http://localhost:3001/band/client/dashboard');
  75 |     });
  76 |     
  77 |     const responses = await Promise.all(requests);
  78 |     const duration = Date.now() - start;
  79 |     
  80 |     // Verify all requests succeeded
  81 |     const failed = responses.filter(r => !r.ok());
  82 |     expect(failed.length).toBe(0);
  83 |     
  84 |     console.log(`[SLA TEST] 1000 concurrent requests completed in ${duration}ms`);
  85 |     
  86 |     // Assert that the total duration for all 1000 requests to resolve is within a reasonable SLA threshold. 
  87 |     // A strict 3000ms SLA for 1000 concurrent requests on a local dev server might fail, but this enforces the check.
  88 |     expect(duration, `1000 concurrent requests took ${duration}ms, exceeding the ${SLA_LIMIT}ms SLA.`).toBeLessThan(SLA_LIMIT);
  89 |   });
  90 | });
  91 | 
  92 | 
```