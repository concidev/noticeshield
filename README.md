# NoticeShield

> Know the deadline. Know the risk. Know what to do next.

NoticeShield turns frightening official notices into plain-language action plans. Upload any document — eviction warning, utility shutoff, court summons, benefits letter, insurance denial, immigration notice — and Gemma 4 tells you exactly what it means, what happens if you ignore it, and what to do right now.

Built for the **Gemma 4 Good Hackathon**.

---

## Try It

**Live demo:** `https://noticeshield.vercel.app` ← _replace after deploy_

**Quickest path to the full experience:**

1. Open the app and tap **See Live Example** on the home screen
2. See a real Pay-or-Quit eviction notice analyzed end-to-end — deadline countdown, risk, action plan, resources
3. Tap **Ask about this notice** → type *"Do I have to leave immediately?"*
4. Watch Gemma answer in real time with streaming output
5. Tap **Translate this report** → choose a language → full report translated in ~10 seconds
6. Tap **Share with Advocate (QR)** → scan the code on another device

Or go to **Upload**, tap any sample notice card, and the full analysis runs automatically.

---

## The Problem

77 million adults in the US struggle to understand official government documents. A tenant who misreads an eviction deadline loses housing. A patient who misses an appeal window pays the full bill. A benefits recipient who doesn't respond in time loses food assistance.

These documents are designed for administrators, not people under stress.

---

## How Gemma 4 Is Used

NoticeShield uses Gemma 4 in three distinct ways:

### 1. Structured Document Analysis
The core analysis prompt asks Gemma to return a strict JSON schema covering urgency, notice type, deadline (ISO date), plain-language summary, risk if ignored, step-by-step next actions, a communication template, and location-aware resource suggestions. The prompt is tuned to Grade 6 reading level, safety-constrained to avoid legal advice, and instructs Gemma to auto-detect non-English notices and translate them automatically.

### 2. Real-Time Streaming
Analysis streams via SSE (Server-Sent Events). Gemma 4's `<thought>` blocks are stripped in transit so only the structured response reaches the client. The analyzing screen shows live token output — judges can watch Gemma working in real time.

### 3. Conversational Follow-Up
After analysis, users can ask Gemma follow-up questions about their specific notice. The follow-up call passes the analysis summary as context and streams the answer back. Suggested questions are contextual to the notice type (e.g. eviction → *"Do I have to leave immediately?"*, court → *"What if I can't appear on that date?"*).

### 4. On-Demand Translation
A second Gemma call translates only the user-facing fields (summary, risk, steps, suggested message, resource details) into 11 languages without re-analyzing the document.

---

## Key Features

| Feature | Detail |
|---|---|
| **Multimodal input** | Photo, image upload, PDF, or pasted text |
| **Streaming analysis** | Live token output from Gemma 4 via SSE |
| **Deadline countdown** | Color-coded days-remaining badge (red ≤ 3 days) |
| **Emergency escalation** | Critical notices show a prominent "Call 211 Now" banner |
| **Follow-up Q&A** | Contextual questions answered by Gemma with full notice context |
| **11-language translation** | On-demand post-analysis translation |
| **Communication assistant** | Draft email and SMS pre-filled with the suggested message |
| **QR code sharing** | Share the action plan with a legal aid worker via QR |
| **Location-aware resources** | US + Canada, province/state-level legal aid and 211 links |
| **Offline history** | Last 12 analyses saved in localStorage |
| **PWA** | Installable on iOS and Android, works offline for saved results |
| **Demo mode** | 6 pre-cached sample analyses with instant results — no API key needed |

---

## Environment Setup

```bash
# .env.local

# Required for live Gemma mode
GEMMA_API_URL=https://your-gemma-endpoint/v1/chat/completions
GEMMA_API_KEY=your-private-key
GEMMA_MODEL=gemma-4-27b-it

# Required for the home screen live/demo indicator
NEXT_PUBLIC_GEMMA_LIVE=true
```

Without `GEMMA_API_URL` and `GEMMA_API_KEY`, the app runs in demo mode using pre-built sample responses — the full UI is visible and functional.

> **Vercel deployment:** add all four variables under Project → Settings → Environment Variables.

---

## Running Locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # lint check
```

---

## Project Structure

```
app/
  api/analyze-notice/   SSE streaming analysis route
  api/follow-up/        SSE follow-up Q&A route
  api/translate-notice/ On-demand translation route
  page.tsx              Main app views and state
  layout.tsx            PWA metadata and fonts

components/
  NoticeUploader.tsx    Upload, camera, paste, and sample flow
  ResultDashboard.tsx   Full analysis output UI
  AnalyzingOverlay.tsx  Streaming loading screen with live token output
  BottomNav.tsx         Mobile navigation

lib/
  gemma.ts              Gemma 4 adapter (analyze, follow-up, translate)
  analyzer.ts           Routes between Gemma and demo mode
  sampleCache.ts        6 pre-built sample analyses for instant demo
  mockAnalyzer.ts       Deterministic fallback for no-API-key mode
  localResources.ts     Location-aware resource builder (US + Canada)
  locations.ts          Supported regions and localities
  types.ts              Shared TypeScript types

public/
  manifest.json         PWA manifest
  sw.js                 Service worker (network-first, API calls never cached)
```

---

## Safety Boundaries

NoticeShield provides general information only — not legal, medical, immigration, or benefits advice. Every analysis includes a prominent disclaimer. Gemma is explicitly prompted never to provide legal advice and to direct users to qualified professionals for high-stakes notices.

---

## Hackathon Criteria

**Social good:** Access to justice and civic literacy for people who receive frightening official documents in languages they don't fully understand, at moments of high stress, without legal resources.

**Gemma 4 technical usage:** Structured JSON extraction, multimodal document input, real-time streaming, conversational follow-up with context injection, multilingual translation — all powered by Gemma 4.

**Completeness:** Fully deployed PWA with live Gemma integration, demo mode for judges without API keys, and end-to-end flows for upload → analysis → translation → sharing → follow-up.
