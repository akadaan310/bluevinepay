# Bluevine Pay

A prototype of **Bluevine Pay** — send money to anyone by paying with your card,
and they claim it by entering their debit card on a redeem link.

Built with Next.js 16 (App Router), Tailwind CSS v4, TypeScript and Supabase.

> **Prototype only.** No payment processor is wired up, nothing is charged, and
> no money moves. See [Security](#security) before doing anything else with it.

## The two flows

| Route      | What it does |
| ---------- | ------------ |
| `/`        | Landing page — what Bluevine Pay is and how it works. |
| `/send`    | **Send flow.** Three steps: recipient + amount → full credit-card form → review and confirm. Ends on a confirmation screen with the generated redeem link. |
| `/r/demo`  | **The demo redeem page** — "Abed Kadaan sent you $600.00", with the full debit-card form to claim it. |
| `/r/:token`| The redeem page for any transfer created through `/send`. |

The `/r/demo` link is deliberately reusable: submissions against it are still
recorded, but the transfer stays `pending` so the next person can walk the demo
too. Real transfers created via `/send` can only be claimed once.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Nothing else is required — with no Supabase
credentials the app falls back to an in-memory store (seeded with the demo
transfer) so the whole flow works immediately.

## Wiring up Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It
   creates `transfers` and `card_submissions` and seeds the `demo` transfer.
3. Copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service role key>   # or the anon key
   ```

4. Restart the dev server. Every transfer and every submitted card form now
   persists to your project.

`src/lib/store.ts` is the single data-access layer — it talks to Supabase when
credentials are present and to the in-memory map otherwise, so the rest of the
app doesn't care which is in play.

## API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/api/transfers` | Create a transfer + store the sender's card. Returns the transfer with its redeem token. |
| `GET`  | `/api/transfers/:token` | Fetch a transfer. |
| `POST` | `/api/transfers/:token/redeem` | Store the recipient's debit card and mark the transfer claimed. |

## Design

Colours come from Bluevine's marketing site — Persian Blue `#1943DC` for the
primary brand and actions, Blue Zodiac `#162D5A` for the deep navy surfaces and
headlines, with a mint accent for success states. Typeface is Plus Jakarta Sans.
The tokens live at the top of `src/app/globals.css`.

## Card handling

`src/lib/card.ts` handles brand detection (Visa / Mastercard / Amex / Discover),
number and expiry formatting as you type, Luhn validation, and per-brand CVC and
digit lengths. `src/components/CardFields.tsx` is shared by both flows so the
send and receive forms behave identically.

## Security

There is none yet, by design — this was scoped as a visual/flow prototype:

- Card details are stored **exactly as typed**, in plaintext, in
  `card_submissions`.
- Row Level Security is disabled on both tables.
- Redeem tokens are short random strings with no expiry and no auth.

Before this touches a real card, card capture has to move to a PCI-compliant
processor (a tokenising iframe such as Stripe Elements) so raw PANs never reach
this server or database — and the tables here should hold nothing but a token
and a last4.
