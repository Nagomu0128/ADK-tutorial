# Frontend Development Progress Log

## Phase 1: Project Setup & Core Layout

### Date: 2026-03-10

### Summary
Completed the full Phase 1 setup of the AI Stock Advisor frontend application, including project configuration, all pages, shared components, API client, type definitions, and mock data.

---

### 1. Dependencies Installed
- `recharts` — charting library for stock price charts
- `lucide-react` — icon library (consistent, lightweight)
- `clsx` — utility for conditional class names
- `date-fns` — date formatting (lighter than moment.js)

### 2. App Structure Created

#### Pages (under `frontend/app/`)
| Route | File | Description |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Google Auth login page with Firebase placeholder |
| `/` | `(main)/page.tsx` | Dashboard — main page with all widgets |
| `/stocks/[symbol]` | `(main)/stocks/[symbol]/page.tsx` | Stock detail with chart, technicals, sentiment |
| `/profile` | `(main)/profile/page.tsx` | Profile settings wizard |
| `/watchlist` | `(main)/watchlist/page.tsx` | Watchlist management with symbol search |
| `/history` | `(main)/history/page.tsx` | Analysis history list (7-day retention) |

#### Layouts
- `(main)/layout.tsx` — Sidebar + main content area layout
- Root `layout.tsx` — Updated with dark theme, app title "AI Stock Advisor"

### 3. Components Created

#### UI Components (`components/ui/`)
- **Button.tsx** — Reusable button with variants (primary/secondary/danger/ghost) and sizes (sm/md/lg)
- **Card.tsx** — Card container with optional title and title-right slot
- **Badge.tsx** — Badge/tag with color variants (green/red/yellow/blue/purple/gray)
- **Gauge.tsx** — SVG semicircle gauge for sentiment display (-1.0 to 1.0 scale)

#### Layout Components (`components/layout/`)
- **Header.tsx** — Top bar with date, "Run Research" button, notification bell, profile link
- **Sidebar.tsx** — Fixed sidebar navigation with Dashboard/Watchlist/History/Profile links + sign out

#### Dashboard Components (`components/dashboard/`)
- **AgentStatus.tsx** — Grid showing 6 agent statuses (pending/running/completed/failed) with icons
- **ResearchReport.tsx** — Personalized report display with tone badge, risk notes, disclaimer
- **SuggestionTable.tsx** — Table with symbol, action (buy/hold/skip), confidence bar, reasoning, feedback buttons
- **SentimentGauge.tsx** — Market-wide gauge + per-symbol sentiment scores
- **RiskScore.tsx** — Overall risk score (0-100), sector concentration bars, alignment check, warnings
- **NewsFeed.tsx** — News list sorted by relevance with impact badges and symbol tags
- **StockList.tsx** — Watchlist stock prices with trend indicators and links to detail pages

#### Stock Components (`components/stocks/`)
- **StockChart.tsx** — 30-day price area chart using recharts, color-coded by trend

#### Profile Components (`components/profile/`)
- **ProfileWizard.tsx** — 4-step wizard: Investment Style, Risk/Experience, Sectors, Themes

#### Watchlist Components (`components/watchlist/`)
- **SymbolSearch.tsx** — Search input with autocomplete dropdown, add/remove symbols, count display

### 4. Lib Files Created

#### `lib/types.ts`
- Full TypeScript type definitions matching all data models from requirements.md section 5
- All types are readonly for immutability
- API request/response types included

#### `lib/api.ts`
- REST API client with functions for all endpoints defined in requirements section 6.1
- Uses `NEXT_PUBLIC_API_URL` env variable (defaults to localhost:3000)
- Functions: `triggerResearch`, `getResearch`, `getResearchStatus`, `getResearchHistory`, `getWatchlist`, `addSymbol`, `removeSymbol`, `getProfile`, `updateProfile`, `sendFeedback`

#### `lib/mock-data.ts`
- Comprehensive mock data for all entities (6 stocks, 6 news items, 6 sentiments, risk assessment, report with 6 suggestions, research history)
- Realistic financial data for demonstration

### 5. Design Decisions

- **Dark Theme**: Professional financial UI with dark background (#0b0f1a), card surfaces (#111827), subtle borders (#1e293b)
- **Color System**: Defined CSS custom properties in globals.css, mapped to Tailwind v4 theme tokens
- **No `class`/`for`/`while`/`let`/`var`**: All components use `const`, arrow functions, Array.map/filter
- **Route Groups**: Used Next.js route groups `(auth)` and `(main)` to separate layouts
- **Mock Data Strategy**: All pages use mock data since backend isn't ready; API client is wired up and ready to swap in
- **Component Composition**: Small, focused components composed together in pages

### 6. Build Status
- Build passes successfully with no TypeScript errors
- All 6 routes render correctly (verified via `next build`)

### 7. Known Limitations / Next Steps
- Firebase Auth not integrated yet (login page has placeholder button)
- No state management library — will add when API integration begins
- Responsive design handles desktop well; mobile sidebar needs hamburger menu
- Stock chart uses generated mock price data — will connect to real API
- Feedback buttons are local state only — need API integration
- Profile wizard saves to console only — need API integration
