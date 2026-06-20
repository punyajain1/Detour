# 🗺️ Detour

**What if doom scrolling actually made you smarter?**

Detour transforms infinite scrolling from a distraction into a tool for curiosity — synthesizing knowledge from space exploration, software engineering, security research, science, and open-source development into a single, endlessly discoverable feed.

> *Escape the doom-scroll. Take a Detour.*

---

## 📸 Screenshots

<p align="center">
  <img src="Public/image.png" width="48%" />
  <img src="Public/image%20copy.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%202.png" width="48%" />
  <img src="Public/image%20copy%203.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%204.png" width="48%" />
  <img src="Public/image%20copy%205.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%206.png" width="48%" />
  <img src="Public/image%20copy%207.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%208.png" width="48%" />
  <img src="Public/image%20copy%209.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%2010.png" width="48%" />
  <img src="Public/image%20copy%2011.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%2012.png" width="48%" />
  <img src="Public/image%20copy%2013.png" width="48%" />
</p>
<p align="center">
  <img src="Public/image%20copy%2014.png" width="48%" />
</p>

---

## ✨ What Makes It Special

- **The Anti-Doom Scroll** — Unlike traditional feeds optimised for addiction, Detour is optimised for *curiosity*. Every card you encounter — whether it's a James Webb Space Telescope image, a trending GitHub repo, or a CVE security advisory — leaves you knowing something new.
- **Unified Infinite Feed** — 21 wildly different API sources are normalised into a single `FeedCard` data structure and rendered as a beautifully animated, endlessly scrollable stream using Framer Motion.
- **Automated Knowledge Sync Engine** — A robust backend cron system fetches, parses, and stores fresh content every 6 hours — fully hands-free, no manual intervention required.
- **Self-Healing & Auto-Pruning** — Cards older than 24 hours are automatically purged, keeping the database lean and ensuring you only ever see fresh, relevant content.
- **Auth-Protected Feed** — JWT-based authentication guards the feed API, keeping your personalised stream private and secure.
- **Mobile-First Gestures** — Built-in swipe/gesture navigation makes Detour feel native on any phone.

---

## 🔌 Integrations (21 Sources)

### 🌌 Space & Science
| Source | Description |
|---|---|
| **NASA APOD** | Astronomy Picture of the Day with expert explanations |
| **NASA Mars Rovers** | Latest raw photos from Curiosity & Perseverance |
| **NASA NeoWs** | Near Earth Object Web Service — asteroid tracking & hazard data |
| **NASA Exoplanet Archive** | Confirmed exoplanet discoveries and orbital data |
| **NASA Image Library** | Curated NASA media library imagery |
| **JWST** | Latest breathtaking images from the James Webb Space Telescope |
| **Space News** | Breaking articles and blogs about space exploration |
| **Space Weather** | Solar flare alerts, geomagnetic storm data, and NOAA forecasts |
| **ArXiv Papers** | Pre-print research papers across Science, AI, and Computing |

### 💻 Programming & Tech
| Source | Description |
|---|---|
| **GitHub Trending** | Hottest repositories across Programming, AI, and Startups |
| **HackerNews** | Top stories and Ask HN discussions from the tech community |
| **Stack Overflow** | Top questions of the week by community vote |
| **LeetCode** | The Daily Coding Challenge |
| **System Design Engine** | Hand-picked architectural deep dives from Netflix, Uber, Airbnb, Cloudflare, and more |
| **Papers With Code** | Latest ML papers with linked open-source implementations |
| **Hugging Face** | Trending models and datasets from the ML community |
| **Codeforces** | Active competitive programming contests and problems |

### 📦 Open-Source Ecosystem
| Source | Description |
|---|---|
| **npm Registry** | Trending JavaScript/TypeScript packages |
| **PyPI** | Trending Python packages |
| **Crates.io** | Trending Rust crates |

### 🔐 Security
| Source | Description |
|---|---|
| **CVE / NVD** | Latest critical and high-severity vulnerability disclosures |

---

## 🛠️ Tech Stack

Detour is a full-stack TypeScript monorepo with distinct `frontend` and `backend` environments.

### Frontend
| Tool | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | Framework & routing |
| React 18 | UI rendering |
| Vanilla CSS (`globals.css`) | Styling & design system |
| [Framer Motion](https://www.framer.com/motion/) | Card animations & transitions |
| [Lucide React](https://lucide.dev/) | Icon library |
| [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) | Infinite scroll triggering |
| TypeScript | Type safety |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + [Express](https://expressjs.com/) | HTTP server |
| [Prisma](https://www.prisma.io/) ORM | Database access layer |
| PostgreSQL | Persistent storage |
| `node-cron` | Scheduled data ingestion jobs |
| `bcryptjs` + `jsonwebtoken` | Auth (password hashing & JWT) |
| `zod` | Runtime schema validation |
| `fast-xml-parser` | XML parsing for space/science feeds |
| TypeScript | Type safety |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL installed and running locally
- API keys for the integrations you want to enable (see [Environment Variables](#-environment-variables))

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/detour.git
cd detour
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env

# Run Prisma migrations to set up the database schema
npm run db:migrate

# Start the development server → http://localhost:4000
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env.local

# Start the development server → http://localhost:3000
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# ── Server ────────────────────────────────────
PORT=4000
NODE_ENV=development
FRONTEND_URL=*                        # or your specific frontend origin

# ── Database ──────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/detour"

# ── Auth ──────────────────────────────────────
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

# ── NASA ──────────────────────────────────────
# Free key at https://api.nasa.gov (DEMO_KEY works for testing)
NASA_API_KEY=DEMO_KEY

# ── GitHub ────────────────────────────────────
# Settings → Developer settings → Personal access tokens (Classic)
# No scopes required for public repo access
GITHUB_TOKEN=your_github_token_here

# ── Stack Overflow ────────────────────────────
# Optional — works without it at lower rate limits
# Register at: https://stackapps.com/apps/oauth/register
SO_API_KEY=your_so_api_key_here

# ── JWST ──────────────────────────────────────
JWST_API_KEY=your_jwst_api_key_here

# ── Public APIs (no keys needed) ──────────────
LEETCODE_GRAPHQL=https://leetcode.com/graphql
HN_ALGOLIA=https://hn.algolia.com/api/v1

# ── Feed Configuration ────────────────────────
FEED_CACHE_TTL_MS=300000              # Cache TTL per source (default: 5 min)
FEED_PAGE_SIZE_DEFAULT=10             # Cards per page (max: 20)
TEST_MODE=false                       # Set true to return mock data only
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     node-cron (every 6h)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  NASA    │  │  GitHub  │  │   CVE    │  │  ...   │  │
│  │  APIs    │  │ Trending │  │   NVD    │  │ (21)   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│                          │                               │
│                  Normalization Layer                      │
│               (→ unified FeedCard type)                  │
│                          │                               │
│                  PostgreSQL via Prisma                    │
│                  (auto-pruned at 24h)                    │
└──────────────────────────┬──────────────────────────────┘
                           │  Express REST API
                           │  GET /api/feed (JWT-protected)
                           │
              ┌────────────▼────────────┐
              │   Next.js Frontend       │
              │  InfiniteFeed component  │
              │  + Framer Motion cards   │
              │  + Swipe gestures        │
              └─────────────────────────┘
```

### How It Works

1. **Ingest** — Every 6 hours, `node-cron` fires parallel requests across all 21 API integrations, respecting rate limits.
2. **Normalise** — Each integration maps its raw API response to the unified `FeedCard` schema (title, source, type, metadata, URL, image, timestamp, etc.).
3. **Store** — Normalised cards are batch-upserted into PostgreSQL via Prisma.
4. **Prune** — A scheduled cleanup job automatically deletes cards older than 24 hours.
5. **Serve** — The Next.js frontend polls `GET /api/feed` (paginated, JWT-authenticated) and renders cards using `InfiniteFeed` with Framer Motion animations and intersection-observer-triggered loading.

---

## 📁 Project Structure

```
detour/
├── backend/
│   ├── prisma/                  # Schema & migrations
│   ├── src/
│   │   ├── integrations/        # 21 API integration modules
│   │   ├── jobs/                # Cron job orchestration
│   │   ├── services/            # Business logic
│   │   ├── controllers/         # Route handlers
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth middleware
│   │   ├── lib/                 # Prisma client, utilities
│   │   └── types/               # Shared TypeScript types
│   └── api-contract.ts          # Shared API contract types
│
└── frontend/
    └── src/
        ├── app/                 # Next.js App Router pages
        ├── components/
        │   ├── cards/           # 19 card components (one per source type)
        │   ├── InfiniteFeed.tsx
        │   ├── FeedCardComponent.tsx
        │   └── BottomNavBar.tsx
        ├── lib/                 # API client, helpers
        └── types/               # Frontend TypeScript types
```

---

## 🧰 Useful Backend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run db:migrate` | Apply pending Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:reset` | Reset database and re-run all migrations |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-new-integration`
3. Add your integration in `backend/src/integrations/`
4. Register it in the cron job orchestrator and add a corresponding frontend card component
5. Open a pull request with a description of the new data source

---

*Built with ❤️ to make the internet feel worth exploring again.*
