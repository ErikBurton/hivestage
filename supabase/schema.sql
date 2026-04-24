-- HiveStage Schema
-- Run this in a fresh Supabase project (e.g. hivestage-test) to set up the database.

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  account_type text not null check (account_type in ('band', 'venue', 'fan', 'admin')),
  avatar_url text,
  bio text,
  city text,
  website text,
  instagram text,
  facebook text,
  spotify text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- BANDS
-- ============================================================
create table public.bands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  genres text[] default '{}',
  created_at timestamptz default now()
);

alter table public.bands enable row level security;

create policy "Bands are viewable by everyone"
  on public.bands for select using (true);

create policy "Band owners can insert"
  on public.bands for insert with check (auth.uid() = user_id);

create policy "Band owners can update"
  on public.bands for update using (auth.uid() = user_id);

create policy "Band owners can delete"
  on public.bands for delete using (auth.uid() = user_id);

-- ============================================================
-- VENUES
-- ============================================================
create table public.venues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  address text,
  city text,
  capacity int,
  created_at timestamptz default now()
);

alter table public.venues enable row level security;

create policy "Venues are viewable by everyone"
  on public.venues for select using (true);

create policy "Venue owners can insert"
  on public.venues for insert with check (auth.uid() = user_id);

create policy "Venue owners can update"
  on public.venues for update using (auth.uid() = user_id);

create policy "Venue owners can delete"
  on public.venues for delete using (auth.uid() = user_id);

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamptz not null,
  venue_id uuid references public.venues on delete set null,
  cover_image_url text,
  ticket_url text,
  is_free boolean default true,
  created_by uuid references auth.users on delete cascade not null,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Events are viewable by everyone"
  on public.events for select using (true);

create policy "Authenticated users can create events"
  on public.events for insert with check (auth.uid() = created_by);

create policy "Event creators can update"
  on public.events for update using (auth.uid() = created_by);

create policy "Event creators can delete"
  on public.events for delete using (auth.uid() = created_by);

-- ============================================================
-- EVENT_BANDS (join table)
-- ============================================================
create table public.event_bands (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events on delete cascade not null,
  band_id uuid references public.bands on delete cascade not null,
  unique (event_id, band_id)
);

alter table public.event_bands enable row level security;

create policy "Event bands are viewable by everyone"
  on public.event_bands for select using (true);

create policy "Authenticated users can insert event bands"
  on public.event_bands for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete event bands"
  on public.event_bands for delete using (auth.role() = 'authenticated');

-- ============================================================
-- FOLLOWS
-- ============================================================
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  fan_id uuid references auth.users on delete cascade not null,
  band_id uuid references public.bands on delete cascade not null,
  created_at timestamptz default now(),
  unique (fan_id, band_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Fans can follow bands"
  on public.follows for insert with check (auth.uid() = fan_id);

create policy "Fans can unfollow bands"
  on public.follows for delete using (auth.uid() = fan_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict do nothing;

insert into storage.buckets (id, name, public)
  values ('event-covers', 'event-covers', true)
  on conflict do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );

create policy "Users can update their own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Event cover images are publicly accessible"
  on storage.objects for select using (bucket_id = 'event-covers');

create policy "Authenticated users can upload event covers"
  on storage.objects for insert with check (
    bucket_id = 'event-covers' and auth.role() = 'authenticated'
  );

create policy "Authenticated users can delete event covers"
  on storage.objects for delete using (
    bucket_id = 'event-covers' and auth.role() = 'authenticated'
  );

-- ============================================================
-- ADMIN HELPER FUNCTION
-- (used by admin panel to delete users)
-- ============================================================
create or replace function delete_user_as_admin(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = target_user_id;
end;
$$;
