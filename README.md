# SkillSetu (स्किलसेतु)
> **हुनर से मंज़िल तक** - AI-Powered Opportunity & Learning Platform for Disadvantaged Communities

SkillSetu is designed to bridge individuals from rural, semi-urban, and low-income communities with local jobs, apprenticeships, micro-enterprise opportunities, and free upskilling. Rather than filtering candidates through English resumes or rigid credentials, SkillSetu evaluates real vocational capabilities, respects commute and childcare boundaries, and provides free-first learning pathways.

---

## 1. Quick Start

Run both frontend (Vite React 18) and backend (Express TypeScript) concurrently from the workspace root:

```bash
# 1. Install all dependencies across root, frontend, and backend
npm install

# 2. Initialize and seed SQLite database with Pune/Maharashtra data
npm run db:seed

# 3. Start development servers
npm run dev

# 4. Run automated test suites (18 unit and integration tests)
npm test

# 5. Build for production
npm run build
```

- **Frontend**: http://localhost:5180 (proxies `/api` to backend)
- **Backend API**: http://localhost:8787
- **Database**: SQLite database stored locally at `backend/skillsetu.db`

---

## 2. Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `8787` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `DB_PATH` | Path to SQLite database file | `./skillsetu.db` |
| `JWT_SECRET` | Secret key used for signing authentication tokens | Dev secret |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated or `*`) | `http://localhost:5180,http://localhost:5173` |
| `DEFAULT_LANGUAGE` | Default platform language | `hi` |
| `ANTHROPIC_API_KEY` | Optional: LLM key for conversational skills extraction (falls back to dictionary) | Empty |
| `OPENROUTESERVICE_API_KEY` | Optional: Live road routing API key (falls back to PMPML matrix) | Empty |

---

## 3. Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts    # Node native SQLite database driver
│   │   │   ├── schema.ts        # Database schema definitions
│   │   │   └── seed.ts          # Seed data (trades, questions, opportunities, resources)
│   │   ├── engine/
│   │   │   └── matching.ts      # Multi-dimensional matching and ranking engine
│   │   ├── routes/
│   │   │   ├── auth.ts          # Phone + OTP authentication with rate limiting
│   │   │   ├── profile.ts       # Profile autosave, steps, and retrieval
│   │   │   ├── match.ts         # Opportunities, learning resources, and career roadmap
│   │   │   ├── sms.ts           # Twilio-compatible SMS webhook handler
│   │   │   └── community.ts     # Local SHG / peer tips board
│   │   ├── tests/
│   │   │   ├── engine.test.ts   # Matching algorithm and ranking tests
│   │   │   └── api.test.ts      # HTTP endpoints and validation tests
│   │   └── server.ts            # Express server initialization
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── manifest.json        # PWA Web App Manifest
│   │   ├── sw.js                # Service Worker for offline shell and data caching
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx    # Phone OTP modal
│   │   │   ├── Dashboard.jsx    # User dashboard (Opportunities, Learn, Career, Profile)
│   │   │   ├── DashboardIcons.jsx # Clean accessible SVG icons
│   │   │   ├── ErrorBoundary.jsx# React boundary for resilient rendering
│   │   │   ├── Home.jsx         # 6-section accessible landing page
│   │   │   ├── MorphNav.jsx     # Navigation bar with language toggle & audio
│   │   │   ├── Onboarding.jsx   # 7-step wizard with voice input & quiz
│   │   │   └── TradeIcons.jsx   # SVG trade icons (no emojis)
│   │   ├── i18n/
│   │   │   ├── LanguageContext.jsx # Bilingual state & SpeechSynthesis narration
│   │   │   ├── en.json          # English strings
│   │   │   └── hi.json          # Hindi (हिंदी) strings
│   │   ├── api.js               # Unified API client with proxy
│   │   ├── lib.js               # GSAP, Lenis, and smooth-scrolling utilities
│   │   ├── styles.css           # Design system (ivory, soft black, burnt orange)
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── CHANGELOG.md
└── package.json                 # Monorepo root orchestration
```

---

## 4. API Endpoints

All endpoints validate request bodies with **Zod** and return consistent JSON structures (`{ success, error, code }`).

### Authentication
- `POST /api/auth/request-otp` - Request 6-digit OTP (rate-limited to 5 requests/min per phone)
- `POST /api/auth/verify-otp` - Verify OTP and receive JWT Bearer token
- `GET /api/me` - Get authenticated user identity
- `PUT /api/me` - Update user details

### Onboarding & Profile
- `PUT /api/profile/step/:n` - Autosave onboarding wizard progress by step (1 to 7)
- `GET /api/profile` - Get complete user profile, access preferences, and skill assessment
- `PUT /api/profile` - Update full profile and skills

### Skills & Quiz
- `GET /api/skills` - List all supported manual and digital trades
- `GET /api/skills/:id/questions` - Fetch practical scenario placement questions
- `POST /api/skills/:id/answers` - Submit scenario answers to receive skill placement level

### Opportunities & Matching
- `GET /api/opportunities` - Get opportunities partitioned into 3 buckets:
  - `bestMatch`: Highest matching in candidate's primary trade
  - `relatedSkills`: Opportunities in complementary trades
  - `nearbyOpportunities`: Roles matching travel boundaries
- `POST /api/applications` - Submit an application and receive direct contact details

### Learning & Roadmap
- `GET /api/resources?mode=online|offline|all&maxCost=` - List learning courses, sorted **free-first** (cost = 0 first, then lowest to highest)
- `GET /api/career-path?role=` - 5-stage deterministic roadmap with tools, income ranges, weekly actions, and government schemes
- `POST /api/progress` - Toggle completion status of roadmap stages

---

## 5. Adding New Skills, Questions & Resources

### Adding a New Skill
1. Open `backend/src/db/seed.ts` and locate `SKILLS_SEED`.
2. Add a new entry with bilingual names and descriptions:
   ```typescript
   {
     id: 'solar_technician',
     category: 'technical_trade',
     en: 'Solar Rooftop Technician',
     hi: 'सोलर रूफटॉप तकनीशियन',
     desc_en: 'Solar panel installation, inverter maintenance & battery wiring',
     desc_hi: 'सोलर पैनल लगाना, इन्वर्टर मरम्मत व बैटरी वायरिंग'
   }
   ```
3. Add a matching SVG icon in `frontend/src/components/TradeIcons.jsx`.

### Adding Practical Quiz Questions
1. In `backend/src/db/seed.ts`, add to `QUESTIONS_SEED`:
   ```typescript
   {
     id: 'q_solar_1',
     skill_id: 'solar_technician',
     order_num: 1,
     scenario_en: 'A customer reports that their solar battery is not charging on a sunny day.',
     scenario_hi: 'ग्राहक बताता है कि धूप होने के बावजूद सोलर बैटरी चार्ज नहीं हो रही है।',
     question_en: 'What is your first step?',
     question_hi: 'आपका पहला कदम क्या होगा?',
     options_en: JSON.stringify(['Check DC breaker & multimeter voltage', 'Replace the battery', 'Change inverter']),
     options_hi: JSON.stringify(['डीसी ब्रेकर और मल्टीमीटर से वोल्टेज नापें', 'बैटरी बदलें', 'इन्वर्टर बदलें']),
     correct_index: 0,
     level_weight: 'Intermediate'
   }
   ```

### Adding Learning Resources
1. In `backend/src/db/seed.ts`, add to `RESOURCES_SEED`:
   ```typescript
   {
     id: 'res_solar_1',
     title_en: 'Solar Installation Practical Basics',
     title_hi: 'सोलर इंस्टॉलेशन प्रैक्टिकल बेसिक्स',
     provider_en: 'National Institute of Solar Energy',
     provider_hi: 'राष्ट्रीय सौर ऊर्जा संस्थान (भारत सरकार)',
     type: 'iti',
     mode: 'offline',
     cost: 0, // Free courses will automatically appear first!
     duration_en: '30 Days',
     duration_hi: '30 दिन',
     level: 'Beginner',
     skill: 'solar_technician',
     language: 'Hindi / English',
     address_en: 'Pune Industrial Training Center',
     address_hi: 'पुणे औद्योगिक प्रशिक्षण केंद्र',
     distance_km: 8.0,
     badge_en: 'Free Govt Certificate',
     badge_hi: 'निःशुल्क सरकारी सर्टिफिकेट'
   }
   ```
2. Re-run `npm run db:seed` to populate the database.

---

## 6. PWA & Offline Support

SkillSetu is configured as a Progressive Web App (PWA):
- **Web App Manifest**: Defined in `frontend/public/manifest.json`.
- **Service Worker**: `frontend/public/sw.js` caches the application shell and runtime queries (`/api/opportunities`, `/api/resources`, `/api/career-path`) using a stale-while-revalidate and network-first caching strategy so core dashboards remain readable offline or in 2G/low-connectivity conditions.

---

## 7. License
MIT License. Created for the empowerment of disadvantaged and manual trade workers.
