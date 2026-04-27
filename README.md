# HiveStage 🐝

Utah's home for live music. HiveStage connects local bands, venues, and fans across Utah — ad-free, algorithm-free, and built by a musician.

🌐 **Live site:** [www.hivestage.live](https://www.hivestage.live)

---

## Tech Stack

- **Frontend:** Next.js 16.2.4 (App Router, Turbopack)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS
- **Email:** Resend
- **Deployment:** Vercel
- **Testing:** Playwright + Pytest + Page Object Model
- **CI/CD:** GitHub Actions

---

## Features

- 🎸 **Band profiles** — bio, genres, city, avatar, social links
- 🏟️ **Venue profiles** — address, capacity, upcoming events
- 🎟️ **Event listings** — cover images, ticket links, free/paid
- 🔍 **Discovery** — search and filter events, bands, and venues
- ❤️ **Fan follows** — follow bands and get notified of new shows
- 📧 **Email notifications** — welcome emails and new show alerts
- 🔗 **Social sharing** — share events with Open Graph previews
- 🛡️ **Admin panel** — manage users, events, and venues
- 🔒 **Auth** — signup, login, password reset

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.14+
- A Supabase project
- A Resend account

### Installation

```bash
# Clone the repo
git clone https://github.com/ErikBurton/hivestage.git
cd hivestage

# Install Node dependencies
npm install

# Install Python dependencies
python -m venv .venv
source .venv/bin/activate
pip install pytest playwright pytest-playwright python-dotenv

# Install Playwright browsers
playwright install chromium
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Testing

HiveStage uses **Playwright + Pytest** with the **Page Object Model (POM)** pattern for end-to-end testing across 102 tests.

### Test structure

```
tests/
├── conftest.py              # Shared fixtures
├── pages/                   # Page Object Model
│   ├── base_page.py
│   ├── login_page.py
│   ├── signup_page.py
│   ├── dashboard_page.py
│   ├── events_page.py
│   └── band_profile_page.py
├── test_auth.py             # Auth tests
├── test_events.py           # Event tests
├── test_bands.py            # Band tests
├── test_admin.py            # Admin tests
└── test_archive.py          # Archive tests
```

### Test Supabase project

CI runs against a **separate Supabase test project** (`hivestage-test`) to avoid consuming production egress quota. The test project has its own schema, auth users, and seed data.

To set up a fresh test project:

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL Editor to create all tables, RLS policies, and storage buckets
3. Go to **Authentication → Users** and create:
   - `erikburton1@gmail.com` — band + admin user
   - `erikburton1+fan@gmail.com` — fan user
   - `erikburton1+band2@gmail.com` — Standard DeViation band user
4. In the SQL Editor, seed the required test data:

```sql
-- Set admin user (replace with actual UUIDs from Authentication > Users)
update public.profiles set account_type = 'admin', is_admin = true
where id = '<band-user-uuid>';

-- Create Standard DeViation band with the hardcoded test ID
insert into public.bands (id, user_id, genres)
values (
  '46c54538-0bdc-4602-b572-95aa427ae0d5',
  '<band2-user-uuid>',
  ARRAY['Rock', 'Indie']
);
```

5. Add these GitHub Actions secrets to the repo:
   - `TEST_NEXT_PUBLIC_SUPABASE_URL`
   - `TEST_NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TEST_SUPABASE_SERVICE_ROLE_KEY`

### Run tests locally

Create a `.env.test` file:

```env
TEST_BASE_URL=http://localhost:3000
TEST_BAND_EMAIL=your_band_email
TEST_BAND_PASSWORD=your_band_password
TEST_FAN_EMAIL=your_fan_email
TEST_FAN_PASSWORD=your_fan_password
TEST_ADMIN_EMAIL=your_admin_email
TEST_ADMIN_PASSWORD=your_admin_password
```

Make sure the dev server is running, then:

```bash
source .venv/bin/activate
pytest tests/ -v
```

Run a specific test file:

```bash
pytest tests/test_auth.py -v
```

Run in headed mode (see the browser):

```bash
pytest tests/ -v --headed
```

---

## CI/CD

GitHub Actions automatically runs all 102 tests on every push to `main`, `develop`, and `feature/**` branches.

The pipeline:
1. Installs Node and Python dependencies
2. Installs Playwright browsers
3. Starts the Next.js dev server pointed at the **test Supabase project**
4. Runs the full test suite
5. Uploads test artifacts on failure

**Branch strategy:**
feature/xxx → develop → main (production)

- `main` → deploys to [www.hivestage.live](https://www.hivestage.live)
- `develop` → Vercel preview URL
- `feature/xxx` → deleted after merging

---

## Database

Supabase PostgreSQL with the following tables:

- `profiles` — all users (bands, venues, fans)
- `bands` — band-specific data (genres, city)
- `venues` — venue-specific data (address, capacity)
- `events` — shows with cover images and ticket links
- `event_bands` — junction table linking events to bands
- `follows` — fan follows for bands

Row Level Security (RLS) is enabled on all tables. The full schema is in `supabase/schema.sql`.

---

## Contact

📧 [hello@hivestage.live](mailto:hello@hivestage.live)
