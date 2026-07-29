# Walk for POP — registration website

Next.js (App Router) marketing + **Walk registration** site for the Prostate
On-Site Project. Captures participant & team registrations to a database, sends
confirmation emails to the registrant **and** to the org, and takes payment
through **PayPal**.

- **Hosting:** Vercel
- **Database:** Neon (serverless Postgres) via Prisma
- **Email:** Resend
- **Payments:** PayPal (walk registration + donations)

---

## Go live tonight — checklist

Everything below is copy-paste. You'll create 3 free accounts, paste some keys,
and deploy. ~20–30 minutes.

### 1. Database — Neon
1. Sign up at <https://neon.tech> → **New Project**.
2. Copy the **Pooled connection** string (starts with `postgresql://…`).
3. Locally, put it in `.env.local` as `DATABASE_URL`, then create the tables:
   ```bash
   npm run db:push
   ```
   You should see "Your database is now in sync with your Prisma schema."

### 2. Email — Resend
1. Sign up at <https://resend.com> → **API Keys** → create one (`re_…`).
2. Set `RESEND_API_KEY`.
3. **Sender address:** to send *from* `prostatecheckup.com`, add the domain under
   Resend → **Domains** and add the DNS records it gives you. Until that
   verifies, leave `EMAIL_FROM="POP Walk <onboarding@resend.dev>"` — emails still
   send and deliver; they just come from the Resend test address.
4. `NOTIFY_EMAIL` is where the org copy of every registration goes. It's set to
   `pop@prostatecheckup.com`. (Your printed flyer lists `marla@prostatecheckup.com`
   — if you want Marla to get them at *that* address, change this, or set it to
   `pop@prostatecheckup.com, marla@prostatecheckup.com` for both.)

### 3. Payments — PayPal
1. At <https://developer.paypal.com> → **Apps & Credentials**.
2. Start on **Sandbox** to test, then flip to **Live** for real money.
3. Create an app; copy **Client ID** and **Secret**.
4. Set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and
   `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (the public one is the same value as the
   Client ID). Set `PAYPAL_ENV=sandbox` (or `live`).
   > `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is baked in at build time — set it in Vercel
   > **before** deploying, and redeploy if you change it.

### 4. Deploy — Vercel
Easiest path (CLI):
```bash
npm i -g vercel
vercel            # from the pop-website/ folder — follow the prompts
# add each env var (or paste them in the Vercel dashboard → Settings → Environment Variables)
vercel --prod
```
Or push this folder to a GitHub repo and **Import** it at <https://vercel.com/new>,
adding the same environment variables in the dashboard.

After the first deploy, make sure the Neon tables exist (step 1's `npm run db:push`,
run locally against the same `DATABASE_URL` you put in Vercel).

---

## Local development
```bash
npm install
cp .env.example .env.local   # fill in real values
npm run db:push              # once, to create tables in your Neon DB
npm run dev                  # http://localhost:3000
```
Without a database or keys the site still renders — the leaderboard shows empty
and registration/email are disabled gracefully.

## Environment variables
See [`.env.example`](.env.example). Summary:

| Var | What |
|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection string |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender, e.g. `POP Walk <walk@prostatecheckup.com>` |
| `NOTIFY_EMAIL` | Org inbox that receives every registration/contact |
| `PAYPAL_ENV` | `sandbox` or `live` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal REST credentials (server) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Same client id, exposed to the browser SDK |

## What gets captured & sent
Each registration stores: name, email, phone, age, t-shirt size, survivor flag,
registration type (solo / join / start a team), adults & children counts,
"sleeping in" + ship-tee options, optional mailing address, optional donation,
the computed total, and payment status. Teams are created/looked-up and linked.
On submit, two emails go out via Resend — a confirmation to the registrant and a
notification to `NOTIFY_EMAIL`.

## Notes / intentional decisions
- **No raw card numbers.** The paper form's card fields are intentionally *not*
  reproduced — that would be a PCI/security liability. All card payment goes
  through PayPal's hosted checkout, so this site never touches card data.
- **Fees** come from the flyer: `$30` adult, `$15` child under 12, `+$5` to ship
  a tee shirt. Change them in [`src/lib/pricing.ts`](src/lib/pricing.ts).
- **Event facts** (date, location, schedule) live in
  [`src/lib/event.ts`](src/lib/event.ts).
- **Logo** was converted from the client's JPEG to a transparent PNG
  (`public/assets/pop-logo.png`). Re-run with `npm run logo` if the source
  changes.

## Project structure
```
src/app/            layout, page, globals.css, and /api routes
src/components/      Nav, Hero (walk info), Mission, Program, Walk (form +
                    leaderboard), Stories, Donate, Contact, Footer
src/lib/            prisma, pricing, paypal, email, registrations, event
prisma/schema.prisma  Team + Registration models
scripts/            make-logo-transparent.mjs (one-time asset step)
```
