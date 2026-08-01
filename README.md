# Tech Enable Solution — LMS

A modern learning platform built with **Next.js 14 (App Router)**,
**Tailwind CSS**, **Supabase** (auth + database), and **Paystack**
(payments).

## Features

- Home page with hero, feature highlights, and popular courses
- Email/password sign up, login, forgot password, and reset password
- Student dashboard with a personalized "Hello, `[Student Name]`" greeting
  and live progress stats
- Course catalog split into **Free** and **Premium** courses
- One-tap enrollment in free courses
- Secure Paystack checkout for premium courses, with automatic enrollment
  on successful payment (both via redirect callback **and** a webhook, so
  enrollment isn't lost if the browser tab closes early)
- **My Courses** page showing every enrollment with a progress ring
- Responsive, Udemy-inspired UI with a distinct visual identity (the
  "Progress Arc" motif used as the logo, avatar rings, and progress
  indicators throughout)
- Row Level Security on every table — students can only ever see or
  modify their own data

## Tech stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Framework  | Next.js 14 (App Router, TypeScript)       |
| Styling    | Tailwind CSS                              |
| Auth & DB  | Supabase (`@supabase/ssr`)                |
| Payments   | Paystack (Transactions API + Webhooks)    |

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run everything in [`supabase/schema.sql`](./supabase/schema.sql).
   This creates `profiles`, `courses`, `enrollments`, and `payments` tables,
   sets up Row Level Security policies, adds a trigger that auto-creates a
   profile row on sign-up, and seeds 8 sample courses (4 free, 4 premium).
3. Under **Authentication → URL Configuration**, set your site URL (e.g.
   `http://localhost:3000` for local dev) and add it to the redirect allow
   list, along with `http://localhost:3000/reset-password` and
   `http://localhost:3000/dashboard`.
4. Copy your **Project URL**, **anon public key**, and **service role key**
   from **Project Settings → API**.

## 3. Set up Paystack

1. Create an account at [paystack.com](https://paystack.com) and switch to
   **Test mode** while developing.
2. Copy your **Secret Key** and **Public Key** from **Settings → API Keys
   & Webhooks**.
3. In the same settings page, set your **Webhook URL** to:
   `https://your-deployed-domain.com/api/paystack/webhook`
   (webhooks require a publicly reachable HTTPS URL — use a tool like
   ngrok for local testing).

## 4. Configure environment variables

Copy the example file and fill in the values from steps 2 and 3:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
```

The service role key and Paystack secret key are used **only** in server
route handlers (`app/api/**`) — never exposed to the browser.

## 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## How the payment flow works

1. A logged-in student clicks **Pay & Enroll** on a premium course.
2. `POST /api/paystack/initialize` verifies the course is actually
   premium and the student isn't already enrolled, records a `pending`
   row in `payments`, and asks Paystack to start a transaction.
3. The student is redirected to Paystack's hosted checkout.
4. On success, Paystack redirects back to `GET /api/paystack/verify`,
   which **independently re-verifies the transaction with Paystack's
   servers** (never trusting the redirect alone) before marking the
   payment successful and inserting the `enrollments` row.
5. As a safety net, Paystack also calls `POST /api/paystack/webhook`
   server-to-server on `charge.success`, which performs the same
   idempotent enrollment — so a student is enrolled even if they close
   the tab before the redirect completes.

## Project structure

```
app/
  page.tsx                 Home
  (auth)/signup/           Sign up
  (auth)/login/            Login
  (auth)/forgot-password/  Forgot password
  (auth)/reset-password/   Reset password (emailed link lands here)
  dashboard/                Student dashboard ("Hello, [Name]")
  courses/                  Free/Premium course catalog
  courses/[id]/             Course detail + enroll/pay
  my-courses/                Enrolled courses with progress
  api/paystack/initialize/  Starts a Paystack transaction
  api/paystack/verify/      Verifies + enrolls after checkout
  api/paystack/webhook/     Server-to-server enrollment backup
components/                 Navbar, Footer, CourseCard, ProgressArc, etc.
lib/supabase/               Browser, server, and middleware Supabase clients
lib/paystack.ts             Paystack API helpers
supabase/schema.sql         Full database schema + RLS + seed data
```

## Deploying

Deploy to [Vercel](https://vercel.com) (or any Node host that supports
the Next.js App Router), add the same environment variables in your
hosting dashboard, and update the Supabase redirect URLs and Paystack
webhook URL to point at your production domain.
