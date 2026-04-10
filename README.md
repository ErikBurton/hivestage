# HiveStage 🐝

Utah's home for live music. HiveStage is a platform for local bands, venues, and fans to connect through live music events across Utah.

🌐 **Live at [www.hivestage.live](https://www.hivestage.live)**

## What it does

- **Bands** — Create a profile, post shows, and get discovered by fans across Utah
- **Venues** — Manage your event calendar and connect with local talent
- **Fans** — Browse upcoming events by city, genre, and date

## Tech stack

- **Framework** — Next.js 15 (App Router)
- **Database** — Supabase (PostgreSQL)
- **Auth** — Supabase Auth
- **Storage** — Supabase Storage
- **Hosting** — Vercel
- **Styling** — Tailwind CSS

## Features

- User authentication with email signup and password recovery
- Role-based accounts (band, venue, fan)
- Band and venue profiles with photo uploads
- Event creation, editing, and deletion
- Public event discovery feed with filters (city, genre, free only)
- Public band and venue profile pages
- Admin dashboard for platform management
- SEO optimized with sitemap and Google Search Console

## Getting started

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a Supabase project and run the schema from the SQL setup
4. Add environment variables to `.env.local`:

5. Run the dev server: `npm run dev`

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Deployment

Deployed on Vercel with automatic deployments from the `main` branch on GitHub.