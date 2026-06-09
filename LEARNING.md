# HiveStage — Learning & Development Journal

This document captures the context, decisions, and learning goals for HiveStage. Use it to onboard Claude in a new chat session.

---

## Project Overview

**HiveStage** is Utah's home for live music — a free, ad-free platform connecting local bands, venues, and fans across Utah without Facebook algorithms.

- **Live site:** https://www.hivestage.live
- **Repo:** https://github.com/ErikBurton/hivestage (public)
- **Built by:** Erik Burton, local Utah musician

---

## Tech Stack

| Layer | Technology | Why chosen |
|---|---|---|
| Frontend | Next.js 16.2.4 (App Router) | Server components, SEO, Vercel integration |
| Database | Supabase (PostgreSQL) | Auth, storage, RLS, real-time, free tier |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Email | Resend | Simple API, generous free tier |
| Deployment | Vercel | Git-based deploys, preview URLs, free hobby tier |
| Testing | Playwright + Pytest | End-to-end browser testing, Python ecosystem |
| CI/CD | GitHub Actions | Automated test runs on every push/PR |

### Key architectural decisions
- **Next.js App Router** — uses server components by default, client components opt-in with `'use client'`
- **Supabase Auth** — handles signup, login, password reset, session management via cookies
- **Row Level Security (RLS)** — Supabase policies control who can read/write each table at the database level
- **Supabase Storage** — stores avatars and event cover images in public buckets
- **Resend** — sends welcome emails on signup and show notifications to followers
- **Two Supabase projects** — `hivestage` (production) and `hivestage-test` (CI only, prevents egress quota burn)

---

## Database Schema

Tables in `supabase/schema.sql`:

| Table | Purpose |
|---|---|
| `profiles` | All users — bands, venues, fans, admins |
| `bands` | Band-specific data (genres, city) |
| `venues` | Venue data (address, city, capacity) |
| `events` | Shows with cover images, ticket links, dates |
| `event_bands` | Junction table linking events to bands |
| `follows` | Fan follows for bands |

### Key columns
- `profiles.is_admin` — boolean, controls admin panel access
- `profiles.account_type` — `'band'`, `'venue'`, `'fan'`, or `'admin'`
- `bands.profile_id` — FK to `profiles.id` (NOT `auth.users`)
- `venues.profile_id` — FK to `profiles.id` (NOT `auth.users`)
- `follows.fan_id` — FK to `profiles.id`

---

## Branch Strategy

```
feature/xxx → develop → main (production)
```

- `main` → deploys to https://www.hivestage.live via Vercel
- `develop` → Vercel preview URL
- `feature/xxx` → deleted after merging

---

## Test Suite

- **111 tests** across 5 files
- **Framework:** Playwright + Pytest + Page Object Model (POM)
- **CI:** GitHub Actions runs on every push to `main`, `develop`, `feature/**`
- **Test Supabase project:** `hivestage-test` — separate from production
- **Test results dashboard:** GitHub Actions → workflow run → HiveStage Test Results

### Test files
| File | What it tests |
|---|---|
| `test_auth.py` | Login, logout, signup, redirects |
| `test_events.py` | Events list, detail, create, Add to Calendar |
| `test_bands.py` | Browse bands, band profiles, follow/unfollow |
| `test_admin.py` | Admin panel, venue creation, access control |
| `test_archive.py` | Past shows, archive page, filters |

### Test accounts (in hivestage-test Supabase project)
| Role | Credentials |
|---|---|
| Band + Admin | stored in GitHub Secrets as TEST_BAND_EMAIL / TEST_BAND_PASSWORD |
| Fan | stored in GitHub Secrets as TEST_FAN_EMAIL / TEST_FAN_PASSWORD |
| Standard DeViation band | stored in Supabase Auth only |
| Test Venue | stored in Supabase Auth only |

### Key test data (hivestage-test)
- Band ID for Standard DeViation: `46c54538-0bdc-4602-b572-95aa427ae0d5`
- Test venue ID: `bbbbbbbb-0000-0000-0000-000000000001`
- Test events: `cccccccc-0000-0000-0000-000000000001` and `cccccccc-0000-0000-0000-000000000002`

---

## Features Built

- ✅ Auth — signup (band/venue/fan), login, logout, forgot/reset password
- ✅ Band profiles — bio, genres, city, avatar, social links, upcoming + past shows
- ✅ Venue profiles — address, capacity, upcoming events
- ✅ Events — create/edit/delete, cover images, ticket links, free/paid toggle
- ✅ Events archive — `/events/archive` with Past Shows badge
- ✅ Fan follows — follow/unfollow bands, fan dashboard shows followed bands' events
- ✅ Add to Calendar — Google, Apple, Outlook on event detail and list pages
- ✅ Email — welcome email on signup, new show notification to followers
- ✅ Admin panel — stats, user/band/venue/event tables, edit bands/venues, delete
- ✅ SEO — sitemap, robots.txt, Open Graph, Google Search Console indexed
- ✅ City dropdown — shared `src/lib/cities.ts` with "Other..." custom city option
- ✅ GitHub Actions test dashboard — dorny/test-reporter with JUnit XML
- ✅ Mobile responsive — event detail, band profile fixes applied

---

## GitHub Actions Secrets Required

| Secret | Purpose |
|---|---|
| `TEST_NEXT_PUBLIC_SUPABASE_URL` | Test Supabase project URL |
| `TEST_NEXT_PUBLIC_SUPABASE_ANON_KEY` | Test Supabase anon key |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | Test Supabase service role key |
| `TEST_BAND_EMAIL` | Test band account email |
| `TEST_BAND_PASSWORD` | Test band account password |
| `TEST_FAN_EMAIL` | Test fan account email |
| `TEST_FAN_PASSWORD` | Test fan account password |
| `TEST_ADMIN_EMAIL` | Test admin account email |
| `TEST_ADMIN_PASSWORD` | Test admin account password |

---

## Known Issues / TODO

- [ ] Venue edit page — changes don't persist (RLS policy blocking profile update for admin-created venues)
- [ ] GitHub Actions Node.js 20 deprecation warning — upgrade to Node 24 before June 2, 2026
- [ ] resend/uuid moderate vulnerability — no fix available yet (resend 6.10.0 is newer than the suggested fix)
- [ ] `supabase/schema.sql` — needs updating to reflect `follows.fan_id` FK pointing to `profiles` not `auth.users`

---

## Learning Goals

Erik wants to go deeper on three topics using HiveStage as the teaching vehicle:

### 1. Tech Stack — The How and Why
- Why Next.js App Router over plain React or Pages Router
- Why Supabase over a custom Express/Node backend
- How server components vs client components work and when to use each
- How Vercel and Supabase integrate (env vars, edge functions, cookies)
- How authentication flows end-to-end (signup → session → protected routes)
- How RLS policies work and why they matter for security
- Why Tailwind over plain CSS or other frameworks

### 2. Testing — Playwright, Python, Page Object Model
- Why Playwright over Cypress or Selenium
- Why Python for tests instead of JavaScript
- How the Page Object Model pattern works and why it reduces test fragility
- How pytest fixtures work (`conftest.py`, `logged_in_band`, etc.)
- How to write a new test from scratch
- How CI/CD connects to the test suite
- How to interpret test failures and fix them

### 3. Debugging
- How to read Next.js error messages and stack traces
- How to use browser DevTools for debugging
- How to debug a failing Playwright test
- How to debug Supabase RLS policy issues
- How to use `console.log` effectively in server vs client components
- How to interpret GitHub Actions CI failure logs

---
