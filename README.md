# 🗺️ Detour

**What if doom scrolling actually made you smarter?**

This project transforms infinite scrolling from a distraction into a tool for curiosity by bringing together knowledge from space exploration, software engineering, science, and research into a single endlessly discoverable feed.

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
- **ArXiv Papers**: Latest pre-print research papers across Science, AI, and Programming.

### 💻 Programming & Tech
- **GitHub Trending**: Hottest repositories across Programming, AI, and Startups.
- **HackerNews**: Top stories and discussions from the tech world.
- **StackOverflow**: Top questions of the week.
- **LeetCode**: The Daily Coding Challenge.
- **System Design Engine**: Hand-picked architectural deep dives from top engineering blogs (Netflix, Uber, Airbnb, Cloudflare), HackerNews discussions, and ArXiv.

## 🛠️ Tech Stack

The project is structured as a full-stack monorepo with distinct Frontend and Backend environments.

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: React 18
- **Styling & Animations**: Vanilla CSS (`globals.css`) + [Framer Motion](https://www.framer.com/motion/)
- **Mobile Experience**: Built-in Swipe/Gesture navigation for intuitive phone use.
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

Detour is powered by a robust backend that handles all the heavy lifting, ensuring the frontend client is incredibly fast and completely distraction-free.

### 1. The Data Ingestion Engine (Cron)
Every 6 hours, the Express/Node.js backend fires off a suite of parallel requests to 3rd-party APIs (NASA, GitHub, HackerNews, LeetCode, etc.). This ensures we respect API rate limits while keeping the content fresh.

### 2. Normalization
Since an astronomy photo from NASA looks very different from a trending repository on GitHub, the backend normalizes all disparate JSON payloads into a single, unified `FeedCard` data structure.

### 3. Smart Storage & Auto-Pruning
These normalized cards are batch-inserted into a PostgreSQL database using Prisma. To keep the app lightning fast and ensure you're only ever seeing new, relevant information, a scheduled job automatically purges any cards older than 24 hours.

### 4. Client Consumption
The Next.js frontend continuously pulls batches of these unified cards via an Express API. The content is then rendered using an `InfiniteFeed` component, utilizing Framer Motion for buttery-smooth scrolling and card reveal animations.

---
*Escape the doom-scroll. Take a Detour.*
