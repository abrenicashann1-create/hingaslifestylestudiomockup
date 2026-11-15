# Hingas website setup

## Before launch

Online booking stays disabled until the studio supplies its actual prices, schedule, coaches, cancellation policy, HitPay account, and images. Do not switch to live payments before sandbox testing.

## Google Sheets and Apps Script

1. Create a Google Sheet and copy its ID from the URL.
2. Open **Extensions → Apps Script**, replace the editor contents with `Code.gs`, and save.
3. In **Project Settings → Script properties**, add:
   - `SPREADSHEET_ID` — the Sheet ID.
   - `STUDIO_EMAIL` — `hingaslifestylestudio@gmail.com`.
   - `SITE_URL` — the public HTTPS website origin, without a trailing slash.
   - `HITPAY_MODE` — `sandbox` initially (`live` only after successful testing).
   - `HITPAY_API_KEY` and `HITPAY_SALT` — from the matching HitPay environment; never put these in site files.
   - `SEMAPHORE_API_KEY` *(optional)* — Semaphore API key for sending automated SMS confirmations to 09XX mobile numbers.
   - `SEMAPHORE_SENDER_NAME` *(optional)* — Sender name (defaults to `SEMAPHORE` or your approved brand name).
4. Run `setupHingas` once and approve the requested Sheets, mail, URL Fetch, and trigger permissions. It creates `Classes`, `Schedule`, `Media`, `Bookings`, and `Requests`, and expires holds every five minutes.
5. Fill `Classes` and `Schedule` using the headers created by the script or the included CSV templates. `active` accepts `TRUE` or `FALSE`; dates use the Sheet's timezone; times use 24-hour `HH:mm`; prices are PHP numbers. Import `Media-template.csv` into the `Media` tab if helpful; its sample rows are hidden (`visible=FALSE`). Only actual, confirmed business details should be entered.
6. Deploy as a **Web app**, executing as the studio's Google account, accessible to anyone. Copy the `/exec` URL. When updating `Code.gs` later, publish a new version to the existing web app deployment.
7. In `app-config.js`, set `appsScriptUrl` to that `/exec` URL. Upload all site files over HTTPS.
8. Configure the HitPay webhook URL `DEPLOYED_APPS_SCRIPT_URL?action=hitpay_webhook` in the matching sandbox account. Use the same sandbox API key and salt. Enable the payment methods actually approved for the account.
9. Run the checklist below with sandbox payments. Only then change `HITPAY_MODE` and the API key/salt to live values and confirm live GCash, QR Ph, card, or Maya availability in the HitPay account.
10. Once the public domain is confirmed, set the Open Graph image to an absolute HTTPS image URL and publish `sitemap.xml` with the final domain. Do not publish a guessed domain.

The website redirects customers to HitPay's hosted checkout. Payment credentials and card/wallet details never enter this website. The provider controls supported payment methods and any provider fees; the website does not add a fee.

## Sheet owner guide

- Add or edit a class in `Classes`. Use a stable unique `id`; prices must be the actual PHP amount. Leave optional class details blank until confirmed.
- Seven class photos are bundled under `img/` and appear automatically on matching class cards and in the gallery. A class row's public HTTPS `photoUrl` takes precedence over its bundled photo.
- Class program posters under `img/` appear below the live calendar on the Schedule page. They contain program/rate details; the date picker remains the source for current bookable sessions.
- The `img/studio rental.png` poster is shown on the rental page and home-page rental teaser. The rental page also presents its listed capacities and 2-hour rates; confirm availability and details with the studio before publishing any updated terms.
- Rental requests capture the preferred room, purpose, date/time, and group size. The Aqua Room selection limits the selectable group-size range to its 20-person capacity; requests remain inquiries until the studio confirms availability.
- Monthly package forms are inquiries only; they do not take payment or promise package eligibility. Confirm the price, session count, validity period, and other terms with the customer before collecting payment.
- Customers can request cancellation or a different future session for an existing paid class booking using its booking reference and booking email. The request is logged and emailed to the studio; it does not cancel the original booking, issue a refund, or hold the requested replacement session.
- Add each dated class occurrence in `Schedule`, using that class ID, a unique session ID, a seat limit, coach name if confirmed, and `active=TRUE`.
- Add public photos and videos to `Media` with `type` set to `photo` or `video`, a title, a public HTTPS `url`, numeric `order`, and `visible=TRUE`. Every visible video needs a public HTTPS `poster`; videos without one stay hidden. Hide an item by setting `visible=FALSE`. Use short self-hosted MP4/WebM/OGG clips under 30 seconds; embed longer videos from YouTube or Facebook. The website loads a player only after a visitor clicks.
- Set `active=FALSE` to hide a session. The public schedule refreshes from the Sheet every minute.
- Class descriptions, ages, levels, what to bring, and photos are read from `Classes`. Public class and media details refresh every minute.
- The home page shows three upcoming live sessions (today first), or clearly labeled sample times before backend configuration.
- Review completed bookings in `Bookings`; statuses are `held`, `paid`, `expired`, or `cancelled`. Unpaid holds expire automatically after 15 minutes.
- Automated booking confirmation emails send styled HTML receipts with Google Maps location and formatted receipt tables.
- Rental, package inquiries, contact messages, and sold-out class waitlist submissions are recorded in `Requests` and emailed to the studio.
- Customers can add booked sessions to Google Calendar (1-tap web link) or Apple/Outlook Calendar (.ics) directly from the confirmation screen or from "My Booked Classes" on the Schedule page.
- Customers can look up their bookings anytime using their `HG-` reference code on the Schedule page.
- Promo and prepaid pass codes (e.g. `HINGASVIP` or `FIRSTFREE` for 100% off passes, `WELCOME10` for 10% off) can be redeemed at checkout; 100% discount passes confirm immediately without payment redirects.
- Interactive Class Search bar dynamically filters sessions by dance style, coach, or class name in real time.
- Dedicated Customer Booking Portal (`booking.html`): Standalone customer booking application with dual calendar (2-week strip & full month), 4-step checkout, promo code redemption, scannable QR studio vouchers, and "My Booked Passes" lookup.
- Front Desk & Staff Portal (`dashboard.html`): Official operations reception portal with secure multi-account staff authentication (Registration and Log In). Features real-time attendee roster, 1-click check-in, fast QR voucher validator, walk-in registration, staff directory, database backup tools, and printable coach attendance sheets.
- Executive Owner Dashboard (`owner.html`): Business monitor and executive portal protected by Owner Master PIN (`owner2026`). Features gross revenue tracking by timeframe (today, week, month, all-time), movement style profitability breakdown, coach leaderboard, payment channels distribution (GCash/Cards/Maya/Cash), commercial rental approvals (Aqua & Lemon rooms), live studio activity feed, database schema download, and full financial ledger export (CSV).
- Relational Database Layer (`database/schema.sql`): Production SQL schema for MySQL/MariaDB with pre-seeded staff, classes, sessions, bookings, and inquiries.
- Backend API (`database/api_auth.php`): Secure PHP endpoints for staff login, registration, and session token verification in WampServer.
- Google Sheets Staff Directory (`Staff` tab in `Code.gs` and `Staff-template.csv`): Synchronized cloud table for staff credentials and status.

## Staff Portal Authentication & Database Guide

### Staff Accounts & Default Credentials
The staff portal (`dashboard.html`) features a dedicated tabbed authentication portal with role-based access:
- **Front Desk Reception**: `frontdesk@hingas.ph` / `staff2026` (STF-001)
- **Studio Operations Manager**: `manager@hingas.ph` / `hingas2026` (STF-002)
- **Lead Movement Coach**: `coach.alex@hingas.ph` / `coach2026` (STF-003)

### Registering New Staff Accounts
To register a new front desk staff member, coach, or manager:
1. Open `dashboard.html` and switch to the **📝 Register Staff Account** tab (or click `+ Add Staff Account` under the **Staff & Database** tab).
2. Enter the staff member's Full Name, Work Email, Mobile, and select their Role (Receptionist, Coach, Manager).
3. Set a password (minimum 6 characters).
4. Enter the **Studio Security Passcode**: `HINGAS-STAFF-2026` (or `hingas2026`). This prevents unauthorized public registrations.
5. Click **Create Staff Account & Log In ➔**.

### Database Architecture & Setup (MySQL / WampServer)
The system includes complete relational database files ready for local or production hosting:
- **`database/schema.sql`**: Full MySQL / MariaDB dump creating the `hingas_studio` database and tables:
  - `staff_users` — staff accounts, SHA-256 hashed passwords, roles, and login history.
  - `classes` — class definitions, duration, capacity, drop-in fee, and accent colors.
  - `sessions_schedule` — scheduled class occurrences with seat occupancy.
  - `bookings` — customer bookings, reference codes (`HG-xxxxxx`), payment records, and check-in stamps.
  - `rental_inquiries` — studio rental applications and monthly package requests.
  - `staff_audit_logs` — complete audit trail of logins, walk-in creations, and check-ins.
- **Importing into WampServer MySQL**:
  1. Open phpMyAdmin (`http://localhost/phpmyadmin`).
  2. Click **Import** and select `database/schema.sql`.
  3. Click **Go**. The `hingas_studio` database and seed data will be created automatically.
- **Client & Offline Database Resilience**:
  - `staff-auth.js` automatically provides an instant, zero-dependency browser database (using Web Crypto SHA-256) so staff can log in, register, and manage check-ins even before MySQL is started or when reviewing locally.
  - Live database snapshots can be exported anytime via **Tab 5 (Staff & Database) → Export JSON Backup**.
- Midnight / Warm Studio mood lighting toggle is available in the header for night viewing.
- Printable studio vouchers with QR code verification stamps can be printed directly from the confirmation screen.
- PWA manifest (`manifest.json`) is enabled for home-screen installation on iOS and Android devices.
- Keep the Sheet restricted to authorized studio staff. It contains customer contact information.

## Test checklist

- [ ] With no Apps Script URL set, the schedule is clearly marked preview-only and booking/payment cannot be completed.
- [ ] With sandbox configuration, the website displays upcoming sessions and current available seats.
- [ ] The home page's upcoming class bar and session list reflect live schedule data and seat counts; preview data remains labeled until configured.
- [ ] Adding a visible class or media row updates the public page within one minute; hidden media does not appear.
- [ ] Each video tile opens the player after a click. Empty video slots show a clear placeholder instead of a broken player.
- [ ] Each photo opens in the full-screen viewer. The close button and Escape key both close it.
- [ ] An available session proceeds to HitPay sandbox checkout; no local “paid” success is shown before a verified webhook.
- [ ] A completed sandbox payment updates the booking to `paid`, decreases seats, and sends customer and studio emails once.
- [ ] Closing checkout or not paying leaves a hold that expires within 15 minutes; the expiry trigger releases it.
- [ ] Two concurrent attempts for the final seat result in at most one held booking.
- [ ] Full sessions cannot be booked; changing the browser-supplied amount or session data cannot override Sheet values.
- [ ] Invalid webhook signatures, wrong amounts, and duplicate webhooks do not confirm a booking.
- [ ] Rental and contact requests validate fields, reject spam honeypot submissions, save to `Requests`, and notify the studio.
- [ ] Rental requests include the selected room, purpose, group size, and date/time in the saved request and studio notification; Aqua Room requests cannot select a group size above 20.
- [ ] Monthly package inquiries are saved and emailed without creating a payment or membership.
- [ ] Booking change requests require a matching paid booking reference and email; cancellation/reschedule requests do not change the paid booking or issue a refund.
- [ ] Reschedule requests are limited to future sessions of the same class with enough current seats; the requested seat is not held until the studio confirms.
- [ ] Check the site at 390px and 1440px, keyboard navigation, visible focus, and reduced-motion settings.
- [ ] With reduced motion enabled, the wavy line is fully drawn, reveal content remains visible, and the moving dot, floating hero collage, and marquee are stopped.

## Placeholder inventory

Replace or confirm these before launch: studio hours; class descriptions, age groups, levels, what to bring, prices, schedule and seat limits; coach names, bios and photos; member testimonials; rental rates, capacities, availability and terms; rental equipment/features; cancellation and refund policy; approved HitPay methods; and the final public domain and share image. The bundled class photos and rental poster are used as imagery; video slots and unprovided studio-specific imagery remain labeled placeholders.

## Still needed from the studio

Confirmed class details and ages, weekly schedule and seat limits, coach names and bios/photos, studio hours, rental rates/capacities/terms, cancellation/refund policy, approved payment methods, video, and the final public domain. Until supplied, the site must not present placeholder content as confirmed.
