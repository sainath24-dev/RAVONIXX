This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🏆 Tournaments & Registration System

RAVONIXX features an integrated, full-featured esports tournament management and team registration platform.

### Key Capabilities
* **Admin Management Console (`/admin/tournaments`):** Create, edit, duplicate, and delete tournaments. Configure game titles, formats (Solo, Duo, Squad), entry fees, prize pools, registration dates, slot limits, rules, and room credentials.
* **Dedicated Registrations View (`/admin/tournaments/[id]/registrations`):** Real-time registration table per tournament with live slot counters, search, sort, pagination, player dossier modal, and placement rank editor.
* **One-Click Export:** Download all registrations in Excel (`.xlsx`) or UTF-8 BOM CSV (`.csv`) with UIDs preserved strictly as text.
* **Public Tournament Arena (`/tournaments`):** Browse tournaments with live status badges, filter tabs, prize pool highlights, and slot availability meters.
* **Mobile-First Registration Form (`/tournaments/[slug]/register`):** Multi-step registration with digits-only UID validation, intra-form & inter-form duplicate UID prevention, duplicate team name prevention, honeypot spam protection, and registration confirmation screen.

### Environment Variables
Configure these in `.env.local`:
```env
# Admin Console Authentication (Set your desired admin password)
ADMIN_PASSWORD=your_secure_password_here
ADMIN_SECRET_KEY=your_random_secret_salt_here

# Discord Webhook (optional, for live registration dispatches)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### How to Test Registration & Export
1. Visit the public tournaments arena at `http://localhost:3000/tournaments`.
2. Click **"REGISTER"** on the sample tournament.
3. Complete the multi-step form (Team Name, Captain, Players, Contact). On submission, receive your official Registration Number (e.g. `#1`).
4. Visit the Admin Console at `http://localhost:3000/admin/login` and log in with your configured `ADMIN_PASSWORD`.
5. Open the tournament's **"Registrations"** view to inspect the team.
6. Click **"Download Excel (.xlsx)"** or **"Export CSV (UTF-8)"** to download the complete spreadsheet.

