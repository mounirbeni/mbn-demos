# CLAUDE.md

Static sales demos of MBN DEV (coffee, barber, beauty, law + secretary desk, rent, ceramics), split out of `mounirbeni/mbndev`. Repo `mounirbeni/mbn-demos` (public) → Vercel project `mbndev-demos` (https://mbndev-demos.vercel.app).

- No build, no backend. Each demo lives in `public/demos/<slug>/` and uses absolute paths `/demos/<slug>/…`; clean URLs `/demo/<slug>[/admin|/secretary]` are rewrites in `vercel.json`. `/` redirects to https://mbndev.ma/portfolio.
- Demo data stays in each visitor's localStorage.
- PIN gate / on-off / expiry are still owned by the platform: `js/gate.js` calls `https://mbndev.ma/api/demos/<slug>/config|unlock` (cross-origin; the platform's CORS allow-list includes this project's domain). Managed from `/dashboard/admin/demos` on the platform (`backend/src/lib/demos.js` → `CATALOG` holds this project's URLs).
- Every public page loads `public/demos/_shared/wa-chat.js` (floating WhatsApp chat).
- Rule kept from the platform: every office-type demo (law, clinic, agency…) ships a secretary desk with its own dashboard, linked via `deskPath` in the platform's `CATALOG`.
- CSP in `vercel.json`: `connect-src` must keep `https://mbndev.ma` for the gate.
- `ceramics` (Atelier Safi, a Safi ceramics artisan): workshops and courses in Morocco and abroad — sessions calendar, booking with deposit and waiting list, "notify me in my city" demand list, host-a-workshop requests, participant space (reference + phone), and an atelier dashboard (sessions/rosters/attendance, bookings, manual bookings, inbox, demand by city, payments, CSV). Content and example prices in `js/config.js`; classic scripts (no modules), data in `js/store.js`.
