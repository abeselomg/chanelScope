# Channel Scope (YouTube Analytics Dashboard)

> **Live Demo:** [channel-scope.vercel.app](https://channel-scope.vercel.app) *(update with your actual deployment URL)*

A web application built to analyze and visualize YouTube channel and video metrics, providing focused insights into content strategies, momentum, and engagement.

## 🚀 Features & Capabilities

**Channel Intelligence & Metrics**
- **Core Statistics**: Track real-time subscriber counts, total video count, and aggregate channel metrics.
- **Monthly Performance Snapshots**: Track "Published this month", "Views this month", "Avg views/upload", and "Avg engagement".
- **Semantic Channel Tags**: Automatically identifies channel behavior, assigning tags like *High momentum*, *Shorts-heavy strategy*, and *Consistent publisher*.
- **Strategy Insights Grid**: Provides calculated analysis cards breaking down a channel's posting schedule, keyword usage, video length patterns, link distributions, and title strategies.

**Advanced Video Filtering & Search**
- **Content Type Isolation**: Toggle between analyzing *All* videos, *Shorts* only, or *Long-form* content only.
- **Date Range Scoping**: Filter content by *All Time*, *This Week*, *This Month*, *Last 90 Days*, or *This Year*.
- **The "Breakout Only" Filter**: One-click filter to hide the bottom 50% of a channel's normal performance, strictly isolating videos that are overperforming.
- **Title Search**: Real-time keyword search across video titles.

**Custom Sorting Mechanics**
Sort a channel's video catalog by:
- **Latest**: Chronological upload order.
- **Total Views**: Raw view counts.
- **Momentum**: Calculated by daily view acceleration (Views Per Day).
- **Engagement Ratio**: Calculated by `(Likes + Comments) / Total Views`.

**Deep-Linked Sharing**
- Every filter, sort, search query, and pagination state is synchronized with the browser URL. By clicking "Copy Link", you can share the exact analytical state with your team, and it will load flawlessly on their device.

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## 📄 Main Pages

The application is structured around two core routes, powered by underlying UI components and services:

- **`/` (Home Page)** 
  - *Location:* `src/app/page.tsx`
  - *Purpose:* The main landing page. This is where users start, typically featuring the main search or input form to query a YouTube channel.
  
- **`/results` (Analytics Dashboard)** 
  - *Location:* `src/app/results/page.tsx`
  - *Purpose:* The core dashboard page. It takes the user's query and displays the comprehensive analytics data, including video cards, channel metrics, and charts. 
  - *Note:* All reusable components that power this page (like VideoCards, Tooltips, or Loading states) are abstracted into `src/components/`.

## 🧠 Build Approach

The first question I asked myself was: *"What does a content strategist actually need when they look at a competitor's channel?"* They don't need every data point YouTube has — they need answers. Which videos are winning? Why? And what can I learn from that in the next 30 seconds?

That framing shaped every decision I made.

**Starting with the user, not the API**

I designed the results page before I wrote a single API call. The information hierarchy — channel identity → key metrics → strategy insights → ranked videos — mirrors how a strategist actually thinks: *"Whose channel is this? How are they doing? What's their playbook? Show me the proof."* Once I knew what the user needed to see, the technical work became about getting the right data into those boxes.

**Turning raw numbers into strategic signals**

The YouTube API gives you view counts, likes, dates, durations. None of that is a *decision*. So I built a computation layer that derives what actually matters:
- **Views Per Day** normalizes performance across time — a 2-day-old video with 50K views is more interesting than a 6-month-old video with 200K. This captures *velocity*, not just volume.
- **Percentile-based momentum tagging** ranks every video against the channel's own baseline (top 15% = Breakout, next 35% = Growing). No arbitrary "100K = viral" thresholds — what's a breakout for a 10K-subscriber channel is different from a 10M-subscriber channel.
- **5 Strategy Insight Cards** are computed automatically: upload cadence, top keywords, Shorts vs. long-form ROI, link/affiliate density, and title length patterns. These are the kinds of observations a strategist would spend 30 minutes calculating manually.

**Making input forgiveness a feature**

I realized early that people paste channel URLs in wildly different formats — `@mkbhd`, full URLs, `/c/` custom paths, legacy `/user/` paths, raw channel IDs, or even just a name like "mr beast". Rather than showing an error, I built cascading resolution that tries every strategy with graceful fallbacks. If someone types it, it should just work.

**Shareable by default**

I kept thinking about the moment after analysis: the user finds something interesting and wants to share it with their team. So I synced every piece of UI state — filters, sort order, search query, page number — to the browser URL. Copy the link, send it in Slack, and your teammate sees the exact same filtered view. No accounts needed, no "save and share" flow. It just works.

**What I intentionally didn't build**

This might be the most important part. I cut historical trend charts, account systems, complex chart visualizations, and demographic breakdowns. Not because I couldn't build them — but because they don't serve the core promise: *instant competitive clarity*. Historical tracking requires a database and scheduled jobs. Demographics aren't available through the public API for third-party channels. Charts slow down scanning speed. Every cut was a product decision, not a shortcut.

**How I used AI to move fast**

I used AI tools throughout the build — not to replace my thinking, but to compress the time between idea and implementation. AI helped me scaffold component structures, debug YouTube API edge cases, stress-test the momentum algorithm against weird inputs (what if there's only 1 video? what about day-zero division?), and polish UI micro-interactions like the loading sequence and toast notifications. This freed me up to spend the majority of my time on what matters most: the product design and data transformation logic.

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/youtube-analytics.git
   cd youtube-analytics
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your YouTube Data API key:
   ```env
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the app.

## 📜 Available Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Creates an optimized production build.
- `npm start` - Runs the application in production mode.

## 🔮 V2 Roadmap

Features being considered for future iterations:
- **Side-by-side channel comparison** — Analyze two competitors simultaneously to spot content gaps.
- **Title suggestions** — Generate title variations based on the channel's proven winning patterns.
- **Historical tracking** — Store snapshots over time to visualize momentum trends week-over-week.
- **Comment sentiment analysis** — Understand *why* a video resonated, not just that it did.
- **Export to PDF/CSV** — Let teams bring analysis into content planning docs and spreadsheets.



## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
