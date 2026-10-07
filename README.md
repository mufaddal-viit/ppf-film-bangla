# PPF Phantom website

Marketing site for a UAE car care studio (paint protection film, ceramic coating, window tint, wraps, detailing). Built to generate leads through WhatsApp, calls and quote forms.

This is the **architecture phase**: every section is semantic, accessible and minimally styled, and reads all content from config. Visual design comes next and only needs tokens (`config/theme.ts`) and component classes (`c-*`).

**Stack:** Next.js 16 (App Router, React Server Components), TypeScript strict, Tailwind CSS 4, next-intl (English + Arabic, RTL), MongoDB (official driver), Zod, React Hook Form, TanStack Query, Resend, Upstash rate limiting, Cloudflare Turnstile, Vitest, Playwright.

## Quick start

Requirements: Node.js 22.18+ (24 recommended) and pnpm. No Docker needed.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`pnpm dev` starts a local MongoDB on `mongodb://127.0.0.1:27018/` (data kept in `.data/mongo`), creates collections and indexes, then runs Next.js at http://localhost:3000. Lead notification emails are logged to the terminal instead of sent, and Turnstile uses Cloudflare's always-pass test keys.

| Command                     | What it does                                          |
| --------------------------- | ----------------------------------------------------- |
| `pnpm dev`                  | Local MongoDB + Next.js dev server                    |
| `pnpm build` / `pnpm start` | Production build / serve it                           |
| `pnpm typecheck`            | Route type generation + `tsc`                         |
| `pnpm lint` / `pnpm format` | ESLint / Prettier                                     |
| `pnpm knip`                 | Fails on unused files, exports and dependencies       |
| `pnpm test`                 | Unit tests (schemas, action pipeline, JSON-LD)        |
| `pnpm test:e2e`             | Playwright smoke tests (starts `pnpm dev` itself)     |
| `pnpm db:setup`             | Create or update collections, validators and indexes  |
| `pnpm db:seed`              | Insert sample leads (run while `pnpm dev` is running) |
| `pnpm admin:create`         | Create the first admin user, or reset a password      |
| `pnpm blog:seed`            | Add three starter blog posts (English and Arabic)     |
| `pnpm assets:placeholders`  | Regenerate placeholder images                         |

## How the project is organised

```
config/            Site config (TypeScript, Zod-validated): business, catalog, navigation, pages, theme, fonts, SEO, integrations, forms, security, features
content/{locale}/  Copy per language: index.ts, services.ts, faqs.ts, sections.ts, messages.json (UI strings), legal/*.mdx, blog/*.mdx
src/app/           Routes. [locale]/ holds every public page; admin/ is the staff panel; actions/ holds server actions; api/health is the health check
src/components/    sections/ (homepage section system), layout/ (top bar, header, footer, floating actions), forms/, ui/, seo/
src/lib/           config/ (schemas + loader), content/ (loader, view models), db/ (MongoDB client + repositories),
                   actions/ (mutation pipeline), security/, email/, seo/, tracking/, validation/
scripts/           dev runner, db setup, seed, placeholder images
tests/             unit/ (Vitest) and e2e/ (Playwright)
```

### The rules this codebase follows

1. **Nothing is hardcoded in components.** Business facts, URLs, prices, colours and labels come from `config/`, `content/` or env variables.
2. **Components never import config.** `src/lib/content` reads and validates config and content, then returns typed view models; pages pass them down as props. ESLint enforces this boundary.
3. **Invalid config or content fails the build** with a readable message, for example `Invalid config/site.ts: contact.phone: Must be an E.164 phone number`.
4. **Facts live in one place.** Prices, warranty years and turnaround times are numbers in `config/catalog.ts`. Content refers to them with tokens like `{priceFrom}`, so pages, JSON-LD and `/llms.txt` always agree.
5. **All database access goes through repositories** in `src/lib/db/repositories`.

## Change the theme

Edit `config/theme.ts`. Each theme has colour tokens for dark and (optionally) light modes, plus radius, spacing unit, container width, shadows and font keys. `active` picks the theme and `mode` picks light or dark.

Tokens become CSS variables on `<html data-theme data-mode>`, and Tailwind utilities map to them: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, `text-success`, `text-warning`, `text-danger`, `rounded-md`, `shadow-md`, `max-w-site`. Tailwind's default palette is removed, so classes like `bg-red-500` do not exist.

To add a font: add a `next/font` loader in `config/fonts.ts`, add its key to `FONT_KEYS` in `src/lib/config/schema.ts`, then reference the key from the theme. Arabic pages automatically use the theme's `arabic` font.

Every component renders stable class hooks (`c-hero`, `c-card`, `c-button`, `c-lead-form`, `data-section="..."`). Restyle them in `src/app/globals.css` without touching component logic.

## Edit content

- **Business details** (name, phone, WhatsApp, address, hours, social links, payment methods, rating): `config/site.ts`. Current values are **dummy placeholders**.
- **Prices, warranties, turnaround**: `config/catalog.ts`.
- **Service text, FAQs, packages, testimonials, portfolio, page titles and SEO**: `content/{en,ar}/`. Each service starts with an `answer`: a self-contained sentence that answers the question directly (for search and AI answers).
- **Section copy**: `content/{locale}/sections.ts`, keyed by the `contentRef` used in `config/pages.ts`.
- **UI strings** (buttons, labels, form errors): `content/{locale}/messages.json`.
- **Blog posts**: add `content/{locale}/blog/<slug>.mdx` that starts with `export const frontmatter = { title, description, publishedAt, author }`.
- **Legal pages**: `content/{locale}/legal/privacy-policy.mdx` and `terms.mdx`. These are templates and need professional review before launch.
- **Images**: files in `public/` are generated placeholders. Replace them, keeping the paths or updating content.

Before launch: replace the sample testimonials, then set `facts.rating` in `config/site.ts` and `reviewStructuredData: true` in `config/features.ts` so Review and AggregateRating JSON-LD are emitted. Only do this with real data.

## Add, remove or reorder sections

Page sections are an ordered list in `config/pages.ts`. Reorder entries, set `enabled: false`, or point `contentRef` at different copy. No code change is needed.

To create a new section type:

1. Add its key to `SECTION_KEYS` in `src/lib/config/schema.ts`.
2. Add its copy schema to `sectionContentSchemas` (and the `sectionCopySchema` union) in `src/lib/content/schema.ts`.
3. Create the component in `src/components/sections/` (props: `SectionProps<'yourKey'>`) and register it in `registry.tsx`.
4. Add copy for every locale in `content/{locale}/sections.ts` and reference it from `config/pages.ts`.

The top bar, header, footer and floating mobile actions are site-wide and controlled by `config/layout.ts`.

## Add a language

1. Add the code to `locale.locales` (and to `rtlLocales` if right-to-left) in `config/site.ts`.
2. Copy `content/en/` to `content/<code>/` and translate it.
3. Register the files in `src/lib/content/source.ts` (one entry per locale).
4. Add a `locale.<code>` label to every `messages.json`.

Routing, hreflang tags, the sitemap and the language switcher pick the new locale up automatically.

## Lead pipeline

Forms (`quote`, `contact`, `callback`) share one component and one Zod schema built from `config/forms.ts`. Every submission runs through `src/lib/actions/pipeline.ts`:

origin check → rate limit (per IP, per form, limits in `config/security.ts`) → honeypot + Turnstile → Zod validation (phones normalised to E.164) → MongoDB write → email to staff (sent after the response) → typed result `{ ok: true, data }` or `{ ok: false, code, fieldErrors }`.

The visitor's first landing page, referrer and UTM parameters are stored in the browser and attached to the lead. Consent is required and stored with the policy version. Logs never contain personal data.

## Analytics

Google Tag Manager is off until you set `gtm.enabled` and `containerId` in `config/integrations.ts`. It then loads only after the visitor accepts the consent banner. The `track()` helper (`src/lib/tracking/track.ts`) sends `form_submit`, `whatsapp_click`, `call_click` and `directions_click` events.

## SEO, AEO and GEO

- Per-page title, description, canonical, hreflang (`en`, `ar`, `x-default`), Open Graph and Twitter tags (`src/lib/seo/metadata.ts`).
- `sitemap.xml`, `robots.txt` (AI crawler policy in `config/seo.ts`, allowed by default), web manifest, and `/llms.txt`, all generated from config and content.
- JSON-LD: LocalBusiness, Organization and WebSite on every page; Service with Offer on service pages; FAQPage wherever FAQs are visible; BreadcrumbList on inner pages.
- All marketing pages are statically generated.

## Security

- Headers on every response: CSP, HSTS (on HTTPS), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP.
- **CSP has no nonces by design.** Nonces force every page to render per request, which disables static generation. Scripts are limited to this site plus the configured third parties (Turnstile, GTM). `'unsafe-inline'` is required for Next.js's own inline bootstrap scripts. Extra hosts go in `config/security.ts`.
- Secrets are validated by `src/lib/env.schema.ts` and only read in `server-only` modules. Production deployments must use Resend, Upstash and real Turnstile keys, otherwise validation fails.
- `dangerouslySetInnerHTML` is only allowed for escaped JSON-LD (ESLint enforced). MDX is compiled from the repository at build time.

## Deploy to Vercel

1. Import the GitHub repository in Vercel (framework: Next.js; the `vercel-build` script runs `db:setup` and then `next build`).
2. Add integrations from the Vercel Marketplace: **MongoDB Atlas** (sets `MONGODB_URI`) and **Upstash Redis** (sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).
3. Set the remaining variables from `.env.example` for Production and Preview: `NEXT_PUBLIC_SITE_URL`, `MONGODB_DB`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` (a verified Resend domain), `LEAD_NOTIFICATION_TO`, `RATE_LIMIT_STORE=upstash`, and real Turnstile keys from Cloudflare.
4. Use a separate database (or `MONGODB_DB`) for Preview so test leads stay out of production.
5. Point the domain at Vercel and set `NEXT_PUBLIC_SITE_URL` to the canonical `https://` origin.

Uptime monitoring can poll `GET /api/health` (200 when the database is reachable, 503 otherwise).

## CI

`.github/workflows/ci.yml` runs on every pull request: typecheck, lint, Prettier, knip, unit tests, build and dependency audit; Playwright smoke tests; and Lighthouse budgets (LCP < 2.5 s, CLS < 0.1, accessibility and SEO ≥ 95, mobile). Lighthouse has no INP lab metric, so Total Blocking Time is tracked as its proxy.

## Admin panel

Staff sign in at `/admin` (English only, outside the locale routes, never indexed).

- **First owner:** `pnpm admin:create --email owner@example.com --name "Owner Name"`. The password is typed at the prompt or read from `ADMIN_PASSWORD`. Run it against production by setting `MONGODB_URI` and `MONGODB_DB` for that one command. Running it again for an existing email resets the password.
- **Roles:** `owner` manages users and sees the activity log; `staff` works with leads. Owners add users and set passwords on the Users page; there is no emailed reset link yet.
- **Leads:** search and filter the inbox, change status, add notes, set a follow-up date, export the filtered list to CSV. The dashboard shows counts and follow-ups due.
- **Sessions:** a random token in an `HttpOnly`, `SameSite=Lax` cookie scoped to `/admin`; MongoDB stores only its SHA-256 hash. Sessions end after 7 days idle or 30 days in total. Passwords are hashed with scrypt (`src/lib/auth/password.ts`).
- **Adding a mutation:** define it with `adminAction` (`src/lib/admin/action.ts`), which runs the session, origin and role checks and Zod validation, then export it from `src/app/actions/admin.ts`. Render it with `<AdminForm>`. Record it with `auditRepository.record`.
- **Sign-in rate limit:** `rateLimits.adminLogin` in `config/security.ts`, counted per IP and per email.

`src/proxy.ts` redirects visitors without a session cookie to the sign-in page. That is only a shortcut: the real check is `requireSession()` in every page and action.

### Blog

Posts are written at `/admin/blog` and stored in the `posts` collection, not in files.

- **Languages:** English is required, Arabic is optional. A post appears on a language's site only when it has that translation, and `hreflang` links list only the languages that exist.
- **Writing:** the article field takes a small Markdown subset (`##` headings, lists, quotes, bold, italic, links). It is parsed into a tree and rendered as React elements (`src/lib/blog/markdown.ts`), so post text can never inject HTML.
- **Publishing:** drafts are visible only in the admin panel. A publish date in the future schedules the post.
- **Caching:** the public blog pages and the sitemap are cached for an hour and refreshed at once when a post is saved or deleted.
- **Cover images:** chosen from the site's existing photos (`src/lib/blog/covers.ts`) until uploads are built.
- **Search:** each post has optional search title and description, and outputs `BlogPosting` structured data.

### Customers

`/admin/customers` holds the people who have bought: contact details, vehicles, tags, notes and whether they agreed to receive offers.

- **From a lead:** "Convert to customer" on a lead creates the customer (or opens the existing one with the same phone number) and marks the lead as Won.
- **Retargeting:** the "not contacted in 90 days" group lists customers who agreed to offers and are due a message. "Mark as contacted today" removes them from it. Any group can be exported as CSV.
- **Consent:** a customer made from an enquiry starts as not agreed. Staff tick the box after asking.

## Not built yet

- Guarantee cards and invoices.
- Content editing for non-developers: content is loaded through the `ContentSource` interface (`src/lib/content/source.ts`), so the admin panel can replace the files without changing components.
- AI drafting and automatic posting for the blog, and image uploads.
- Customer accounts: the `(account)` route group is reserved for them.
