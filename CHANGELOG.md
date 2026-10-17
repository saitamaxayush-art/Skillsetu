# SkillSetu (स्किलसेतु) - Changelog

## [2.0.0] - 2026-10-17

### Full Product Pivot: From ProofPass to SkillSetu
Pivoted the product direction to **SkillSetu (स्किलसेतु)**: an AI-driven, dignified opportunity-matching and skill-progression platform for individuals from disadvantaged, rural, and low-income communities across India.

### 1. Database & Seeding
- Migrated database layer to Node v26 native SQLite (`node:sqlite`) with foreign key enforcement and WAL mode.
- Seeded 10 core vocational trades: Stitching & Tailoring, Electrician & Solar, Plumbing, Carpentry, Cooking & Tiffin, Beauty & Salon, Driving, Web Development, Data Entry, and Mobile Repair.
- Added 40+ verified local opportunities across Pune & Maharashtra districts with realistic transit times, bus fares, pay ranges, and "Why this matches you" explanations.
- Added 60+ online & offline learning resources sorted free-first (100% free government portals, ITI, PMKVY, SWAYAM, and local center programs).
- Added 25+ bilingual practical scenario quiz questions designed for empathetic placement without rejection.
- Added 5-stage career progression roadmaps for all trades with weekly free actions, income targets, and government schemes (PM Vishwakarma, Mudra, PMEGP).

### 2. Backend Engines & API Architecture
- Created multi-dimensional matching engine (`backend/src/engine/matching.ts`) considering skill alignment, commute limits, transit costs, WFH preference, hours, and equipment owned.
- Implemented Section 7 REST API routes:
  - `POST /auth/request-otp` (with in-memory rate limiting: 5 req/min per phone)
  - `POST /auth/verify-otp` (JWT authentication)
  - `GET /me`, `PUT /me`
  - `PUT /profile/step/:n` (onboarding autosave per wizard step)
  - `GET /skills`, `GET /skills/:id/questions`, `POST /skills/:id/answers`
  - `GET /opportunities` (partitioned into 3 buckets: `bestMatch`, `relatedSkills`, `nearbyOpportunities`)
  - `POST /applications` (direct employer WhatsApp, tel, and SMS generation)
  - `GET /resources` (online/offline filters, max cost slider, strict lowest-to-highest cost sorting)
  - `GET /career-path` (5-stage deterministic timeline)
  - `POST /progress` (toggleable roadmap milestone tracking)
- Maintained support for SMS webhook (`sms.ts`) and community peer tips (`community.ts`).
- Added Zod validation schemas across all route handlers with standardized `{ error, code }` JSON responses.
- Removed committed `backend/.env` and generated comprehensive `backend/.env.example`.
- Automated test suites (`engine.test.ts`, `api.test.ts`): 18/18 tests passing.

### 3. Internationalization & Accessibility (i18n & a11y)
- Full bilingual support in Hindi (`hi`) and English (`en`) across every screen, button, badge, and scenario question.
- Styled typography with `Noto Sans Devanagari` and `Outfit`.
- Integrated `SpeechSynthesis` text-to-speech audio reader on every wizard step and opportunity card for low-literacy users.
- Added Web Speech API voice input for recording what users have made or built.
- All interactive elements adhere to minimum 48px touch targets, high contrast ratios, and `prefers-reduced-motion` compliance.

### 4. UI / UX Redesign
- Redesigned landing page in exact Section 8 order:
  1. Hero section with clear bilingual headline, supporting copy, "Start free" button, "Log in" link, and animated SVG vector showing a person's skill blossoming into an opportunity.
  2. "How it works" in 4 steps (Tell skills -> Answer questions -> Get matched -> Learn & grow).
  3. "Who it is for" icon grid covering 10 trades with clean SVGs (zero emoji).
  4. Platform highlights (bilingual, low internet, nearby opportunities, free-first learning, career path, voice support).
  5. Interactive live mini demo allowing immediate exploration of 5-stage career paths.
  6. Minimalist footer with Privacy, Terms, and language switch.
- Banned and eliminated: purple gradients, pill buttons (`border-radius: 9999px`), fake reviews, fake counters, emoji icons on cards, em dashes (`—`), and "made with AI" labels.
- Preserved brand palette (60% warm ivory `#f6f1e7`, 30% soft black `#1d1a17`, 10% burnt orange `#b54610`) in both Light and Dark modes.

### 5. Bug Fixes & Progressive Web App (PWA)
- Implemented scroll-to-top on route changes and wizard Next/Back with `lenis.scrollTo(0, { immediate: true })` and fallback to `window.scrollTo(0, 0)`.
- Moved focus to the step heading (`ref={stepHeadingRef}`) on wizard step changes for assistive technology.
- Added `ScrollTrigger.refresh()` after route and language switches.
- Added `ErrorBoundary` around main router views.
- Added animated skeleton loader shimmer cards across Dashboard tabs for smooth loading states.
- Created `manifest.json` and `sw.js` service worker caching the application shell and offline opportunity/learning data.
