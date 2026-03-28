# YouTube Competitor Analyzer — V1

> Paste a competitor’s YouTube channel URL and instantly see which videos are crushing it this month.

---

## What It Does

A lightweight intelligence tool for media teams. No dashboards to configure, no accounts to create. Paste a channel URL, click Analyze, get answers.

**The one question it answers:** Which videos are winning right now?

---

## V1 Feature List

### 1. Paste Channel → Instant Results

**Core experience**

- **Flow:** Paste YouTube channel URL → click **Analyze** → results appear quickly.
- **Accepted URL shapes:** `@handle`, `/channel/UC…`, `/c/…` (and equivalent mobile URLs).

**What must happen**

- Auto-fetch the channel and latest videos for the selected period.
- Focus on **this month** by default (with **Last 30 days** as the second option—see Time Filter).
- No setup friction beyond an API key (see API Setup).

> The magic is **speed**, not sophistication.

---

### 2. Top Performing Videos Ranking

**The single most important screen.**

Show:

- Top videos for the active time range
- **Views**
- **Upload date** (relative when helpful, e.g. “3 days ago”)
- **Engagement:** likes and comments
- **Growth indicator** — surfaced via momentum badges (see §3)

**Sort**

- Most views (default)
- Most likes
- Most comments
- Most recent

**Filter (minimal)**

- **Minimum view count** — hides low-signal noise on high-volume channels (e.g. presets or slider: 0 / 10K / 50K).

Clients want one answer: **Which videos are winning right now?**

---

### 3. Momentum / Trend Signal

Raw views are misleading. Add simple intelligence—**no ML required**; e.g. **views per day** vs channel average for the period.

**Badge examples (copy can be tuned in UI)**

| Signal        | Meaning (conceptual)                          |
| ------------- | --------------------------------------------- |
| Trending      | Strong early traction / high views-per-day    |
| Growing fast | Outperforming channel baseline for the period  |
| Slowing down | Past peak; traction cooling vs early window    |

This makes the tool feel smart without heavy backend logic.

---

### 4. Clean Video Cards

Each video should communicate at a glance (target: **scan in ~5 seconds**):

- Thumbnail (16:9)
- Title (truncate to ~2 lines)
- Views, upload date, likes, comments
- **Performance / momentum badge**

**Interaction**

- Click card (or explicit control) → open video on YouTube in a new tab.
- Hover: subtle elevation (e.g. shadow-sm → shadow-lg), calm transition.

---

### 5. Time Filter (Minimal)

Only what V1 needs:

| Option         | Default |
| -------------- | ------- |
| This month     | Yes     |
| Last 30 days   | No      |

Anything beyond this is **out of scope for V1**.

---

### 6. Simple UI (Mixpanel-Style)

Dense when needed, **visually quiet**: grayscale-first, one primary accent (blue), strong hierarchy, generous whitespace.

**Principles**

- Grayscale dominates (~90%+ of chrome); **blue** for primary actions only.
- Minimal chrome: no heavy sidebar; **one** clear primary action per view.
- Readable at a glance: channel strip + toolbar + results grid.

**Suggested layout**

- Top bar: product name + **Settings** (API key) + **Copy public link** (share only — no export actions in the header).
- Hero input: URL + **Analyze**.
- Below: channel summary (avatar, name, subscribers, video count in range).
- Toolbar: time filter, sort, min-views filter.
- Full-width responsive grid or table of video rows (per final UI).

---

### 7. Shareable page via public link

**In scope.** This is the primary way results leave the app — not Saved/Recent lists and not header export.

**Behavior**

- **Public URL** — The address bar encodes everything needed to reconstruct the view: channel identifier (handle or id), time range, and key filters (e.g. segment, min views, sort) as query parameters.
- **Anyone with the link** can open it in a new tab or device and land on the **same results page** (same layout and parameters). Data is **re-fetched** from YouTube on load so numbers stay current.
- **Copy public link** — Prominent control (top bar or results header) copies the full URL to the clipboard; optional “Open in new tab” for self-check.
- **Screenshot-friendly** — Layout stays credible when captured (balanced margins, no clipped hero).

**Implementation note**

- On a **static client-only** app, recipients still need a valid **YouTube API key** in Settings to load data (unless you add a small server-side proxy with a shared key later). Document that clearly next to the share control so shared links are not confused with “no key required” unless you ship a proxy.

**Explicitly not required for V1**

- “Why it’s winning” **AI sidebar** (narrative insights panel).
- **Saved** and **Recent** channel lists in the global nav.
- **Export** in the header (no CSV / PDF / “Download report” in the top bar).

---

## API Setup

V1 uses **YouTube Data API v3**.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable **YouTube Data API v3**.
3. Create an API key; restrict it appropriately for production.
4. User pastes the key once (e.g. settings modal); store locally (`localStorage`) — **never** send it anywhere except Google’s API.

---

## States

| State           | When                         | UX expectation                                      |
| -------------- | ----------------------------- | --------------------------------------------------- |
| Idle           | Before first success          | Empty / input-focused; short value prop             |
| Loading        | Request in flight             | Skeleton grid matching card layout                  |
| Success        | Data returned                 | Ranking + cards + filters                           |
| Empty          | No uploads in period        | Clear message; suggest other time range             |
| Error — key    | Missing / invalid API key     | Prompt to open settings; no blame-y tone            |
| Error — URL    | Unresolved channel            | Show accepted URL formats                           |
| Error — quota  | API quota exceeded            | Explain briefly; retry guidance                     |

Primary button: **disabled** or **loading** label while analyzing (`opacity-50`, `cursor-not-allowed` where appropriate).

---

## Documentation

- **[Milestones](./MILESTONES.md)** — Ordered build checkpoints and acceptance criteria (build in sequence).
- **[Implementation plan](./IMPLEMENTATION_PLAN.md)** — Phases, routing, task breakdown, and definition of done for engineers.

---

## Out of Scope (V2+)

- **“Why it’s winning” AI sidebar** — narrative / LLM-generated insight panel.
- **Saved analyses** and **Recent channels** in global navigation.
- **Export in the header** — CSV, PDF, “Download report,” or similar global export actions.
- Multi-channel comparison, deep topic clustering, 90-day / all-time ranges, saved watchlists, cross-channel leaderboards, complex ML scoring.
- Optional later: CSV/export from a **results** toolbar (not in header) if product asks for it again.

---

## Tech Direction (V1)

| Layer    | Suggestion                                      |
| -------- | ----------------------------------------------- |
| UI       | Single-page app or single HTML artifact + Tailwind |
| Data     | YouTube Data API v3 (client-side key for demo; server proxy recommended for production) |
| Persistence | `localStorage` for API key only            |
| Hosting  | Any static host                                                 |

---

## Ship Checklist (V1 Done)

- [ ] Paste → analyze works for common channel URL formats.
- [ ] “This month” and “Last 30 days” both return correct windows.
- [ ] Ranking, sort, and min-views filter behave as specified.
- [ ] Momentum badges shown for every video (consistent rules).
- [ ] **Public shareable link** reproduces the same channel + range + filters (document query param format); Copy public link works.
- [ ] Loading, empty, and error states are implemented.
- [ ] UI matches “simple / Mixpanel-like” bar: calm, fast to scan, screenshot-friendly.
