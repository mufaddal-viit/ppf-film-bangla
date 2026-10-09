# Handover: Phantom PPF site, admin panel and warranty system

Written 9 October 2026. Read this first in a new conversation, then `AGENTS.md` and `README.md`.

## The project in one paragraph

A bilingual (English and Arabic) marketing site for Phantom PPF, a paint protection film business in
Dubai, with an admin panel behind it. The original scope was a fixed-price quotation (AED 999): site,
SEO, lead management, customers, blog, guarantee cards, invoices. The client then asked for a larger
**warranty system with three portals** (admin, vendors, customers). That is the work in progress.

## Where things stand

| Area                                                                     | State                                                                  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Public site, blog, lead forms                                            | Done, on `main`                                                        |
| Admin panel: leads, customers, blog, users, activity log                 | Done, on `main`                                                        |
| Admin restyle (white sidebar, blue accent, Poppins) and new sign-in page | Done, on `main` (commit `75c04bd`)                                     |
| Warranty phase 1: products, vendors, vendor sign-ins, vendor portal      | **Built, not committed** (27 changed or new files in the working tree) |
| Warranty phases 2 to 6                                                   | Not started                                                            |

Branches `fossil-redesign` and `main` are both at `75c04bd` on GitHub
(`mufaddal-viit/ppf-film-bangla`). The user's habit is: commit on `fossil-redesign`, push, then
fast-forward `main` to it. Commit or push only when asked.

## The warranty system the client wants

Source: a sample STEK warranty card (`26AEW8HKJE_detail.pdf` in the project root; it holds a real
customer's details and is excluded from Git through `.git/info/exclude`. Do not commit it).

Rules agreed with the user:

- **Admin** creates products, creates vendors and their sign-ins, allocates stock to vendors, and can
  see everything (vendors, customers, phone numbers, warranties) plus an analytics dashboard.
- **Vendor** creates customers and their sign-ins, records installations using only the stock the
  admin allocated, and generates the warranty. One warranty per installation, enforced in the database.
- **Customer** can only view their products and warranty cards and download the PDF. Customers cannot
  generate a warranty.
- Answers to the four design questions:
  1. Stock is real rolls: LOT number and size, used up as installations are recorded.
  2. Customers sign in with email and password (no SMS codes).
  3. A warranty is valid the moment the vendor generates it. No approval step; the admin is notified
     and can void it.
  4. The card is Phantom-branded, with the same five blocks as the STEK card (owner, vehicle,
     installation shop, product, photos) and a QR code, in a better design, as a downloadable PDF.

Fields on the card: warranty ID and QR; owner name, email, phone; vehicle year, brand, model, trim,
VIN, licence plate; shop name, installer, email, phone, address; installation date, product, LOT
number, hidden tag, coverage end date, roll size, coverage type, notes, photos.

### Build order

1. **Roles, portals, vendors, products** — built (see below).
2. **Stock allocation**: admin allocates rolls (product, LOT number, width and length) to a vendor.
3. **Vendor portal**: customers, vehicles, installations that consume allocated stock.
4. **Warranty**: generation, PDF card, public QR check page (no personal data on it), customer portal
   at `/account`, admin notification.
5. **Admin analytics**: warranties by month, product and vendor; stock allocated against used;
   expiring warranties; exports (admin only, logged).
6. **Hardening**: security review, photo uploads (type and size checked, stored privately),
   second sign-in step for the admin.

## What phase 1 added

- `src/lib/db/collections.ts`: `products`, `vendors`, `portalUsers` collections and indexes; sessions
  gained a `scope` field (`vendor`; admin sessions have none).
- `src/lib/auth/session.ts`: `sessionStore({ scope, cookie, path })`, shared by both sign-ins. Admin
  uses cookie `admin_session` on `/admin`; vendors use `vendor_session` on `/vendor`.
- `src/lib/admin/action.ts`: `portalAction(portal, requireSignedIn)` is the shared pipeline (session,
  origin, permission, Zod, handler). `adminAction` and `vendorAction` are built on it.
- `src/lib/vendor/`: `constants.ts`, `session.ts` (`requireVendorSession`), `auth.ts` (sign-in,
  sign-out, change password).
- `src/lib/admin/products.ts`, `src/lib/admin/vendors.ts`: owner-only actions. Vendor sign-ins get a
  random temporary password, shown once, that must be replaced at first sign-in.
- Repositories: `product.repository.ts`, `vendor.repository.ts`, `portal-user.repository.ts`.
- Pages: `/admin/products`, `/admin/products/[id]`, `/admin/vendors`, `/admin/vendors/new`,
  `/admin/vendors/[id]`; `/vendor/login`, `/vendor`, `/vendor/account`.
- `src/components/admin/login-shell.tsx`: sign-in layout shared by admin and vendor.
- `src/proxy.ts`, `src/app/robots.ts`: `/vendor` treated as a signed-in area and kept out of search.
- `tests/unit/warranty.test.ts`.

The security rule to keep through every later phase: **every vendor query is filtered by the vendor
id from the signed-in session, never by an id from the page or URL.**

### Verified

Typecheck, lint and 74 unit tests pass. A Chrome run against the local app passed 24 checks: product
add, edit, retire and duplicate name; vendor and sign-in creation; password stored only as a hash and
absent from the activity log; forced password change; a vendor cannot open the admin panel; a session
token from one portal is rejected by the other; switching a sign-in off signs the person out at once.

A second run on 9 October passed 15 more checks, covering the two steps the first run did not reach:
a reset password signs the vendor out, stops the old password working and forces a new password at
the next sign-in; deactivating a shop signs its people out and blocks sign-in until it is reactivated.

## Open points

- `config/site.ts` still has the template's US phone region and `America/Chicago` timezone. Phone
  numbers therefore need the country code (`+971…`). Switching to UAE also affects the public forms;
  the user has not decided.
- Only the owner role can see Products and Vendors. Staff cannot.
- `content/en/blog/ppf-vs-ceramic-coating.mdx` and the Arabic copy are unused; deleting them was
  refused by the permission system, so they are still there.
- Not started from the original quotation: invoices, AI blog drafting, content and image editing with
  uploads, Vercel go-live.
- The three-portal warranty system is larger than the "guarantee card" line in the AED 999 quotation.

## Running it locally

- Dev server: `pnpm dev -p 4010 --webpack`, then http://localhost:4010. Ports 3000, 3100 and 3200
  belong to other projects, and the default bundler (Turbopack) crashes on this machine.
- Database: MongoDB through `mongodb-memory-server` on `127.0.0.1:27018`, data kept in `.data/mongo`,
  database name `ppf`. After changing collections or indexes, run `pnpm db:setup`.
- Local test sign-in for the admin panel (local data only): `owner@phantom.test` /
  `local-dev-password-1`. Vendor sign-ins are created from the admin panel.
- **This machine is short on memory** (often under 1 GB free). The database and the typecheck have
  both crashed because of it. If sign-in fails with "Something went wrong", the database has stopped.
  Avoid running the browser tests, the database and a build at the same time.

## Working rules for this codebase

- `AGENTS.md`: this is Next.js 16 with breaking changes; read the guide in
  `node_modules/next/dist/docs/` before writing code. After adding a route, run `pnpm exec next typegen`.
- Colours come from theme tokens only, never hex. Styles live in `src/app/styles/*.css` as `c-*`
  classes; components carry structure only. The admin look is scoped in `src/app/styles/admin.css`.
- Components may not import `@/lib/config`, `@/lib/db/*` or `@/lib/env`; pages pass what they need.
- Every form action goes through `adminAction` or `vendorAction`, with a `'use server'` wrapper in
  `src/app/actions/`.
- Checks before committing: `pnpm exec tsc --noEmit`, `pnpm exec eslint src config tests`,
  `pnpm exec vitest run`. A pre-commit hook runs ESLint and Prettier on staged files.
- Client-facing documents: light theme only. Do not add back to the quotation: the getfossil.com
  reference, a "Prepared by" block, a VAT line, exclusions, the campaign-source line, or the list of
  seven product pages. getfossil.com is only a design reference; the brand is Phantom PPF.

## Git author on this machine

Commits are recorded as "Nehar Shinz" because that name and a travnook.com email are set in the
machine-wide Git settings (`C:\Users\Tariq\.gitconfig`). Pushes go out through the GitHub account
`itzmeahammed`. To use a different name for this project only, run these in the project folder:

```
git config user.name "Your Name"
git config user.email "you@example.com"
```

This changes future commits only; the five existing commits keep the old name.
