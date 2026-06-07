# 🗺️ Detour

**What if doom scrolling actually made you smarter?**

This project transforms infinite scrolling from a distraction into a tool for curiosity by bringing together knowledge from space exploration, software engineering, science, and research into a single endlessly discoverable feed.

## ✨ Features That Make It Special

- **The Anti-Doom Scroll**: Unlike traditional feeds optimized for addiction, Detour is optimized for curiosity. You encounter everything from James Webb Space Telescope images to trending AI repositories.
- **Unified Infinite Feed**: We take wildly different API payloads (from HackerNews, NASA, LeetCode) and normalize them into a single, beautifully animated stream of knowledge cards using Framer Motion.
- **Automated Knowledge Sync Engine**: A robust backend cron system automatically fetches, parses, and securely stores fresh content every 6 hours without human intervention.
- **Self-Healing & Auto-Pruning**: The database stays lean and blazing fast by automatically purging knowledge cards older than 24 hours. Only the freshest data survives.

## 🔌 Integrations

Detour currently synthesizes data from the following sources:

### 🌌 Space & Science
- **NASA APOD**: Astronomy Picture of the Day.
- **NASA Mars Rovers**: Latest photos from the Martian surface.
- **NASA NeoWs**: Near Earth Object Web Service (Asteroid tracking).
- **JWST**: Latest breathtaking images from the James Webb Space Telescope.
- **Space News**: Latest articles and blogs about space exploration.

### 💻 Programming & Tech
- **GitHub Trending**: Hottest repositories across Programming, AI, and Startups.
- **HackerNews**: Top stories and discussions from the tech world.
- **StackOverflow**: Top questions of the week.
- **LeetCode**: The Daily Coding Challenge.

## 🛠️ Tech Stack

The project is structured as a full-stack monorepo with distinct Frontend and Backend environments.

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: React 18
- **Styling & Animations**: Vanilla CSS (`globals.css`) + [Framer Motion](https://www.framer.com/motion/)
- **Icons**: Lucide React
- **Language**: TypeScript

### Backend
- **Server**: Node.js with [Express](https://expressjs.com/)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Background Jobs**: `node-cron`
- **Language**: TypeScript

## 🚀 Getting Started

Follow these instructions to get Detour up and running on your local machine.

### Prerequisites
- Node.js (v18+ or v20+)
- PostgreSQL installed and running
- Various API Keys (NASA, etc.) depending on what you want to fetch.

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables (ensure DATABASE_URL is set)
# Create a .env file with your local database URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/detour"

# Run Prisma migrations to setup the database schema
npm run db:migrate

# Start the development server (runs on http://localhost:4000)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server (runs on http://localhost:3000)
npm run dev
```

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    subgraph ExternalAPIs[External APIs]
        NASA(NASA APIs)
        GitHub(GitHub Trending)
        HN(HackerNews)
        LC(LeetCode)
        JWST(JWST Images)
    end

    subgraph Backend[Backend - Node.js + Express]
        CronJob[feed-sync.job.ts] -->|Fetch every 6 hours| ExternalAPIs
        CronJob -->|Normalize & Insert| DB[(PostgreSQL Database)]
        CronJob -->|Auto-prune > 24h| DB
        API[Express API] -->|Query| DB
    end

    subgraph Frontend[Frontend - Next.js App Router]
        UI[InfiniteFeed UI] -->|Fetch Batch| API
        Card[FeedCardComponent] --- UI
    end
```

1. **The Cron Job (`feed-sync.job.ts`)**: Every 6 hours, the backend fires off parallel requests to all registered 3rd-party APIs (NASA, GitHub, HackerNews, LeetCode, etc.).
2. **Normalization**: The disparate JSON payloads are mapped into a unified `FeedCard` structure.
3. **Storage**: Cards are batch-inserted into the PostgreSQL `feed_cards` table via Prisma. Old cards (>24 hours) are purged to ensure content remains fresh.
4. **Client Consumption**: The Next.js frontend fetches these cards using an infinite scrolling mechanism (`InfiniteFeed.tsx`) and displays them in a distraction-free, animated UI (`FeedCardComponent.tsx`).

---
*Escape the doom-scroll. Take a Detour.*
