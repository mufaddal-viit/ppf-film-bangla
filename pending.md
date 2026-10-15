# Pending Items - Phantom PPF Website

## Landing Page - UI Fixes (Mobile Responsive + Pixel Perfect)

### Hero Section

- [ ] Stats row (10yr, 7.5mil, 99GU, etc.) wraps awkwardly on small phones (<375px) - needs `flex-wrap` with consistent spacing
- [ ] CTA buttons ("Discover Fossil PPF" / "Contact us") touch screen edges on 320px viewports - add horizontal padding guard
- [ ] Service chips below CTAs are missing/hidden on mobile - verify visibility
- [ ] Hero heading "UNMISTAKABLY STRONG" font size too large on small screens, causes tight line spacing
- [ ] Subheading letter-spacing (tracking) too wide on mobile - hard to read

### Showcase (Scroll-Driven Carousel)

- [ ] Takes excessive scroll distance on mobile (~4-5 full screen heights to get through 4 slides)
- [ ] Slide text ("PROTECTED, TODAY AND FOR YEARS TO COME") clips at left edge on mobile
- [ ] Progress bar at bottom barely visible

### Trust Strip

- [ ] Marquee ticker text cut off at edges - needs fade masks on mobile

### Services/Products Grid

- [ ] Product images load without visible aspect ratio placeholder - causes CLS on slow connections
- [ ] Arrow icon (top-right) overlaps product name on narrow screens

### Climate / Why Choose Us / Technology (Points Sections)

- [ ] Index numbers ("01", "02") overlap with title text on small screens
- [ ] Icon + title + body layout needs tighter mobile spacing

### Facility / Our Promise

- [ ] Photos section has no horizontal padding on mobile - images touch screen edges
- [ ] Large gap between heading and photo grid on mobile

### Contact CTA

- [ ] Form card (white) appears empty/blank on desktop - form may be lazy-loaded too aggressively
- [ ] Map and contact card overlap on tablet breakpoints (768-1024px)
- [ ] Contact details card too narrow on some screen sizes

### Footer

- [ ] Bottom bar content ("2026 Phantom PPF") partially hidden behind floating action bar on mobile
- [ ] `pb-24` padding works but needs `safe-area-inset-bottom` for notched phones

### Floating Actions (Bottom Bar)

- [ ] Only 2 actions (Call, Directions) - no WhatsApp since it's disabled; looks sparse with just 2 items
- [ ] Needs `backdrop-filter` for glass effect to match header quality

### Header

- [ ] Mobile hamburger menu - verify it opens/closes smoothly
- [ ] Logo overlaps with nav on mid-size tablets (~800px)

---

## Page-Wise Pending Work

### Home `/`

- [ ] All landing page UI fixes above
- [ ] Packages section exists in registry but not enabled - decide if needed
- [ ] Portfolio section exists but not enabled - decide if needed
- [ ] Reviews/testimonials section not enabled (`reviewStructuredData: false`)
- [ ] Process section not enabled

### Services `/services`

- [ ] Page exists and works - verify mobile layout
- [ ] Check service detail pages (`/services/[slug]`) on mobile

### About `/about`

- [ ] Verify all sections render properly on mobile
- [ ] Story section content review

### Contact `/contact`

- [ ] Form validation UX - error messages visible on mobile
- [ ] Turnstile widget positioning on small screens
- [ ] Test form submission end-to-end

### Blog `/blog`

- [ ] Feature enabled, verify blog list and detail pages render
- [ ] Seed at least 2-3 blog posts for launch
- [ ] Check blog post images and typography on mobile

### Gallery `/gallery`

- [ ] Page exists but minimal (facility + contact CTA only)
- [ ] Decide: add real gallery content or remove from routes

### Prices `/prices`

- [ ] Page exists but just shows services grid + contact CTA
- [ ] Decide: add actual pricing or remove from routes

### Privacy Policy `/privacy-policy`

- [ ] Template content - needs professional legal review for US market
- [ ] Replace placeholder text with actual policy

### Terms `/terms`

- [ ] Template content - needs professional legal review for US market
- [ ] Replace placeholder text with actual terms

---

## Pre-Handover Checklist

### Content

- [ ] Replace all placeholder/template copy with final client-approved text
- [ ] Verify all product images are final (not mockups)
- [ ] Add real facility photos (currently using placeholders)
- [ ] Write or source real blog posts (at least 3)
- [ ] Arabic translation review - verify all `content/ar/` files are complete and accurate
- [ ] Legal pages reviewed by attorney

### Configuration

- [ ] `config/site.ts` - verify all business details (phone, email, address) are correct
- [ ] `config/integrations.ts` - set up real GTM container ID (currently `GTM-XXXXXXX`)
- [ ] `config/integrations.ts` - decide on WhatsApp (currently disabled)
- [ ] `.env` - set production MongoDB URI
- [ ] `.env` - set real Turnstile keys (currently using test keys)
- [ ] `.env` - set real Resend API key and sender email
- [ ] `.env` - set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] `config/site.ts` - currency is USD, timezone is America/Chicago - verify correct

### Admin Panel

- [ ] Create production admin user (`pnpm admin:create`)
- [ ] Test lead form submission -> admin panel flow
- [ ] Test blog create/edit/publish flow
- [ ] Test customer creation from lead conversion
- [ ] Verify CSV export works

### SEO

- [ ] Verify `robots.txt` allows crawling in production
- [ ] Verify `sitemap.xml` generates correctly
- [ ] Test JSON-LD structured data with Google Rich Results Test
- [ ] Set up Google Search Console
- [ ] Verify hreflang tags for en/ar

### Performance

- [ ] Run Lighthouse audit - target 90+ on all metrics
- [ ] Verify image optimization (sharp installed, Next.js Image used everywhere)
- [ ] Check bundle size - no unnecessary dependencies
- [ ] Test on real mobile device (not just browser resize)

### Deployment

- [ ] Set up Vercel project and link repo
- [ ] Configure all env variables in Vercel dashboard
- [ ] Set up production MongoDB (Atlas or equivalent)
- [ ] Set up Upstash Redis for rate limiting (or use memory for low traffic)
- [ ] Configure custom domain + SSL
- [ ] Test production build locally (`pnpm build && pnpm start`)
- [ ] Verify CSP headers don't block any resources

### Testing

- [ ] Run `pnpm test` - all unit tests pass
- [ ] Run `pnpm test:e2e` - all Playwright tests pass
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm typecheck` - no type errors
- [ ] Manual test: form submission on mobile
- [ ] Manual test: Arabic (RTL) layout on all pages
- [ ] Manual test: all navigation links work
- [ ] Cross-browser test: Chrome, Safari, Firefox
