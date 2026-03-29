# Channel Scope (YouTube Analytics Dashboard)

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

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
