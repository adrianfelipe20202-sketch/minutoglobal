# :globe_with_meridians: MinutoGlobal

[![Live Site](https://img.shields.io/badge/Live-minutoglobal.co-f44336?style=for-the-badge&logo=vercel&logoColor=white)](https://minutoglobal.co)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq-LLaMA_3-FF6B35?style=for-the-badge)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Facebook API](https://img.shields.io/badge/Facebook-Graph_API-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://developers.facebook.com/)

**An autonomous, AI-powered news portal that scrapes, rewrites, publishes, and promotes news articles -- all without human intervention.**

MinutoGlobal aggregates real-time news from 11+ RSS sources across Colombia and the world, uses LLaMA AI to rewrite articles in original voice, stores them in a PostgreSQL database, serves them on a responsive news website, and auto-publishes to Facebook with engagement-optimized copy -- entirely on autopilot.

---

## :sparkles: Features

- **Autonomous Content Pipeline** -- Scrapes RSS feeds, rewrites articles with AI, and publishes to the web automatically
- **AI-Powered Rewriting** -- Every article is rewritten by LLaMA 3 via Groq Cloud to produce original, journalist-quality content
- **Smart Facebook Publishing** -- 3 daily posts at optimal times (9am, 2pm, 8pm Colombia time) with 4 rotating copy styles
- **Engagement Optimization** -- Links posted as first comment to avoid Facebook algorithm penalties; every post ends with a reader question
- **Category-Aware Hashtags** -- Automatic hashtag selection based on article category (Colombia, World, Economy, Technology, Sports)
- **Daily Budget Control** -- Hard cap of 150 articles/day with intelligent rate limiting across time slots
- **Fallback Feed System** -- 8 backup RSS sources activate when primary feeds are dry (>30 min without new content)
- **Random Fallback Images** -- Category-specific Unsplash images when RSS feeds lack media
- **Dual-Redundancy Architecture** -- Vercel cron as primary + local Node.js monitor as backup
- **Production Security Hardening** -- CSP headers, XSS protection, HSTS, WordPress/PHP attack blocking, slug sanitization

---

## :wrench: Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 | Server-rendered news portal with ISR (30s revalidation) |
| **Backend** | Next.js API Routes (TypeScript) | Cron handler for RSS scraping + AI rewriting + FB posting |
| **Database** | Supabase (PostgreSQL) | Article storage, deduplication, publish state tracking |
| **AI Engine** | Groq Cloud (LLaMA 3.1 8B / 3.3 70B) | Article rewriting + Facebook copy generation |
| **Social Media** | Facebook Graph API v21.0 | Auto-posting with photo uploads + first-comment links |
| **Hosting** | Vercel (Serverless) | Zero-config deployment with edge functions |
| **Scheduling** | Vercel Cron + cron-job.org | Dual-trigger architecture for reliability |
| **Monitoring** | Node.js local script | Redundant backup scanner + publisher |

---

## :building_construction: Architecture

```
                          cron-job.org (external)
                                |
                                | HTTP GET (every 10 min)
                                v
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Serverless)                      │
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────┐   │
│  │  Next.js App  │    │  /api/cron  (Route Handler)      │   │
│  │              │    │                                    │   │
│  │  - Homepage  │    │  1. Scrape 11 RSS feeds            │   │
│  │  - /noticia/ │    │  2. Deduplicate against Supabase   │   │
│  │  - Sidebar   │    │  3. Rewrite with Groq AI (LLaMA)  │   │
│  │  - Trending  │    │  4. Save articles to database      │   │
│  │              │    │  5. Check FB slot schedule          │   │
│  │  ISR: 30s    │    │  6. Generate FB copy (4 styles)    │   │
│  └──────┬───────┘    │  7. Post to Facebook + comment     │   │
│         │            └──────────────┬───────────────────┘   │
│         │                          │                         │
└─────────┼──────────────────────────┼─────────────────────────┘
          │                          │
          │  SELECT                  │  INSERT / UPDATE
          v                          v
   ┌─────────────────────────────────────┐
   │         SUPABASE (PostgreSQL)        │
   │                                      │
   │  articles                            │
   │  ├── slug, title, summary, content   │
   │  ├── category, image_url, source     │
   │  ├── source_url (dedup key)          │
   │  ├── fb_post_id (publish tracking)   │
   │  ├── is_published, published_at      │
   │  └── read_time, created_at           │
   └─────────────────────────────────────┘
          │
          │  Redundant backup
          v
   ┌─────────────────────────────┐        ┌───────────────┐
   │  Monitor (Node.js, local)   │───────>│  Facebook     │
   │  - Scans RSS every 20 min   │  API   │  Page         │
   │  - Posts FB on schedule     │        │  (Auto-post)  │
   └─────────────────────────────┘        └───────────────┘
```

---

## :gear: How the Automation Works

### Content Pipeline

1. **RSS Scraping** -- The cron endpoint fetches the latest items from 11 primary feeds (El Tiempo, Semana, BBC Mundo, France24, Portafolio, Xataka, AS Colombia, etc.). If no new content is found in 30+ minutes, 8 fallback feeds activate (El Pais, CNN Espanol, DW, NYT, Infobae, etc.).

2. **Deduplication** -- Every source URL is checked against the last 500 stored articles. Duplicates are silently skipped.

3. **AI Rewriting** -- Each new article is sent to Groq Cloud (LLaMA) with a structured prompt that returns a rewritten title, summary, and multi-paragraph body. A fallback parser handles non-standard AI responses.

4. **Image Resolution** -- The system extracts images from RSS enclosures, `media:content`, `media:thumbnail`, or inline HTML `<img>` tags. Invalid images (tracking pixels, logos, broken URLs) are filtered out and replaced with random category-specific Unsplash photos.

5. **Storage** -- Articles are saved to Supabase with a unique slug, publish timestamp, and metadata.

### Facebook Publishing

| Slot | Time (Colombia, UTC-5) | Copy Style |
|------|----------------------|------------|
| 1 | 09:00 AM | Question |
| 2 | 02:00 PM | Fact/Data |
| 3 | 08:00 PM | Quote or Controversy |

- **Copy generation** uses a separate AI prompt with 4 rotating styles: `pregunta`, `dato`, `cita`, `polemica`
- **Link placement** -- The article URL is posted as the first comment (not in the main post) to avoid Facebook's external link penalty
- **Every post** ends with a reader question to drive engagement
- **Category hashtags** are appended automatically (e.g., `#Colombia #Noticias #Bogota`)

### Scheduling Architecture

```
Vercel Cron (vercel.json)          cron-job.org (external)
        |                                  |
   "0 12 * * *"                    Every ~10 minutes
        |                                  |
        +----------> /api/cron <-----------+
                     (idempotent)
```

Both triggers hit the same idempotent endpoint. The budget system (150 articles/day) and slot-based FB publishing ensure no duplicates or over-posting regardless of trigger frequency.

---

## :rocket: Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project with an `articles` table
- A [Groq Cloud](https://console.groq.com/) API key
- A [Facebook Page](https://developers.facebook.com/) with a long-lived page access token
- (Optional) [Vercel](https://vercel.com/) account for deployment

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/MinutoGlobal.git
cd MinutoGlobal
```

### 2. Set up the database

Create the `articles` table in Supabase SQL Editor:

```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  source TEXT,
  source_url TEXT UNIQUE,
  read_time TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  fb_post_id TEXT
);

CREATE INDEX idx_articles_published ON articles (is_published, published_at DESC);
CREATE INDEX idx_articles_source_url ON articles (source_url);
CREATE INDEX idx_articles_slug ON articles (slug);
```

### 3. Configure environment variables

**Web (`web/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
FB_PAGE_ID=your-facebook-page-id
FB_PAGE_TOKEN=your-page-access-token
CRON_SECRET=your-secret-for-cron-auth
SITE_URL=https://minutoglobal.co
```

**Monitor (`monitor/.env`):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
FB_PAGE_ID=your-facebook-page-id
FB_PAGE_TOKEN=your-page-access-token
SITE_URL=https://minutoglobal.co
```

### 4. Install & run

```bash
# Web app
cd web
npm install
npm run dev          # http://localhost:3000

# Monitor (separate terminal)
cd monitor
npm install
node index.js
```

### 5. Deploy to Vercel

```bash
cd web
npx vercel --prod
```

The `vercel.json` cron configuration will activate automatically on deployment.

---

## :file_folder: Project Structure

```
MinutoGlobal/
├── web/                          # Next.js application (deployed to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/cron/route.ts       # Core automation: scrape + AI + FB
│   │   │   ├── noticia/[slug]/page.tsx  # Individual article pages
│   │   │   ├── page.tsx                 # Homepage with category filtering
│   │   │   ├── layout.tsx               # Root layout with SEO metadata
│   │   │   ├── quienes-somos/           # About page
│   │   │   ├── contacto/               # Contact page
│   │   │   └── politica-privacidad/    # Privacy policy
│   │   ├── components/
│   │   │   ├── Header.tsx              # Sticky nav with category filters
│   │   │   ├── NewsCard.tsx            # Article card (featured + compact)
│   │   │   ├── NewsImage.tsx           # Image component with fallbacks
│   │   │   ├── BreakingTicker.tsx      # Animated breaking news bar
│   │   │   ├── Sidebar.tsx             # Trending topics + Facebook CTA
│   │   │   ├── AdBanner.tsx            # Google AdSense integration
│   │   │   └── Footer.tsx              # Site footer
│   │   └── lib/
│   │       ├── articles.ts             # Supabase queries + formatters
│   │       ├── supabase.ts             # Database client + types
│   │       └── mock-data.ts            # Fallback data for empty DB
│   ├── vercel.json                     # Cron job configuration
│   ├── next.config.ts                  # Security headers + image domains
│   └── package.json
├── monitor/                      # Redundant local automation
│   ├── index.js                        # RSS scanner + FB publisher
│   └── package.json
└── assets/                       # Design assets (profile/cover templates)
```

---

## :camera: Screenshots

> _Screenshots coming soon. Visit [minutoglobal.co](https://minutoglobal.co) to see the live site._

<!-- 
Add screenshots here:
![Homepage](./assets/screenshots/homepage.png)
![Article Page](./assets/screenshots/article.png)
![Facebook Post](./assets/screenshots/facebook-post.png)
-->

---

## :chart_with_upwards_trend: RSS Sources

| Source | Category | Type |
|--------|----------|------|
| El Tiempo | Colombia, Economy, Sports | Primary |
| El Espectador | Colombia | Primary |
| Semana | Colombia | Primary |
| BBC Mundo | World | Primary |
| France24 | World | Primary |
| Portafolio | Economy | Primary |
| Xataka | Technology | Primary |
| AS Colombia | Sports | Primary |
| El Pais | World, Economy | Fallback |
| CNN en Espanol | World | Fallback |
| DW Espanol | World | Fallback |
| Infobae | World | Fallback |
| NYT World | World | Fallback |
| Hipertextual | Technology | Fallback |
| Marca | Sports | Fallback |

---

## :lock: Security

- **Content Security Policy** with strict directives for scripts, styles, fonts, and frames
- **HSTS** enforcement with `includeSubDomains`
- **Slug sanitization** -- Only `[a-z0-9\-_]` characters accepted, max 200 chars
- **WordPress/PHP honeypot redirects** -- Common attack paths (`/wp-admin`, `/xmlrpc.php`, `/phpmyadmin`) redirect to homepage
- **Sensitive file blocking** -- `.env`, `.git` paths are redirected
- **Cron authentication** -- Bearer token or query secret required for the automation endpoint

---

## :page_facing_up: License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with <b>Next.js</b>, <b>Supabase</b>, and <b>Groq AI</b><br/>
  Deployed on <b>Vercel</b> &mdash; runs 24/7 autonomously
</p>
