# Saarthi (सारथि) — Engineering Handoff Brief

**For:** Claude Code (Terminal session)
**From:** Product & Strategy session
**Purpose:** Bootstrap the codebase, architecture, and development plan. Single source of truth for engineering decisions. Read this before writing code.
**Version:** v2 — post-pivot. Renamed from Awaaz. Vision broadened to executive intelligence. New modules: Saarthi Assistant (RAG), Brief Generation (PPTX/PDF/DOCX), News monitoring, Document ingest. Six-role RBAC model added.
**Hackathon:** Build with AI: Code for Communities (Google Cloud, national)
**Track:** Track 1 — People's Priorities: AI for Constituency Development Planning
**Sibling docs (read these too):** `DESIGN_HANDOFF.md`, `SITEMAP.md`

---

## 1. Mission

Build a working prototype of **Saarthi** (सारथि — Sanskrit for *charioteer*, the trusted guide who counsels the warrior while seeing the whole battlefield) — an AI-powered executive intelligence platform for India's Members of Parliament.

**The problem Saarthi solves:** Decision-makers receive fragmented, repetitive, time-consuming information from multiple departments, citizen grievances, news, reports, and social media. They have no efficient way to identify priorities, understand what's changed, or take timely action.

**What Saarthi does:**
- Ingests scattered inputs — citizen priorities (WhatsApp / X / Reddit / web widget), news monitoring, department reports, uploaded documents
- Clusters signals semantically across sources; cross-references against public government datasets in BigQuery
- Ranks issues by demand, severity, and MPLADS compliance leverage; tags each with an action pathway
- Produces on-demand executive briefings ("Today's Top 5 Issues")
- Answers natural-language questions over the constituency corpus via **Saarthi Assistant** (RAG over clusters + submissions + documents + public data)
- Generates one-click outputs: MPLADS recommendation letters, briefing PDFs, meeting-prep PPTX decks, policy summary DOCX

**Core value prop:** MPs spend hours reading fragmented reports. Saarthi collapses that to minutes.

**Primary user goal:** When a user opens Saarthi, they should immediately understand *what requires attention*, *what has changed*, *what is escalating*, and *what actions are recommended*.

**Vision (pitch, not v1 build):** Same platform extends to Cabinet Ministers with their own briefing modes. See §16 for the Vaishu flow diagram scope (approval chains, work verification, citizen close-loop) — pitch as roadmap, not v1.

### Submission deliverables (from hackathon brief)
1. Public GitHub repository with source code
2. Demo video (3–5 min) showing end-to-end flow
3. Pitch deck (10–12 slides)
4. Deployed prototype link

### Rubric weights (every module traces back to these)
- AI/Technical Execution — 25%
- Deployability & Scalability — 25%
- Problem-Solution Fit — 20%
- Inclusivity & Accessibility — 15%
- Impact Potential — 10%
- Presentation & Clarity — 5%

---

## 2. Locked decisions (don't relitigate)

| Decision | Value |
|---|---|
| **Product name** | Saarthi (सारथि) |
| **Primary framing** | Executive intelligence for decision-makers |
| **Demo persona** | MP (Bansuri Swaraj, New Delhi Lok Sabha Constituency) |
| **Vision persona (pitch only, not built)** | Cabinet Ministers |
| **Pilot constituency** | New Delhi Lok Sabha |
| **Category scope (v1)** | Water & Sanitation · Public Health & Air Quality · Urban Infrastructure |
| **Intake channels** | WhatsApp · X/Twitter · Reddit · Web widget · News monitoring · Document upload (PDF/DOCX) |
| **Explicitly excluded intake** | Facebook, Instagram (Meta Graph API restrictions) |
| **AI outputs** | Executive briefing · Ranked action queue · Saarthi Assistant Q&A · MPLADS letters · Generated PDF/PPTX/DOCX |
| **Design system** | UX4G Design System 2.0 base + two contributed patterns (Priority Card, Live Feed) |
| **Cloud provider** | Google Cloud — mandatory per hackathon brief |
| **Primary AI stack** | Gemini 2.5 Pro (reasoning, briefs), Gemini 2.5 Flash (classification, high volume), Vertex AI text-embedding-004 (clustering + RAG), Google Cloud STT, Vertex AI Vision |
| **Fallback AI (mentioned in pitch)** | Sarvam AI for code-mixed Hindi speech |
| **Role model** | 6-role RBAC (see §15) |
| **Language** | English + Hindi UI as first-class (not translation afterthought). 22 scheduled languages for citizen intake. |

---

## 3. Tech stack (prescriptive — push back only with a specific reason)

### 3.1 Language & framework
- **TypeScript everywhere.** One language, one type system, one context.
- **Next.js 14+ (App Router)** for the dashboard app. Handles frontend + BFF API routes + SSR.
- **Node.js 22 LTS** runtime.
- **pnpm 9+** for package management (fast, workspaces for the monorepo).

### 3.2 Google Cloud services (this hits the "utilise Google Cloud" requirement)

| Service | Role |
|---|---|
| **Cloud Run** | Deploy Next.js app + separate ingestion/ML worker |
| **Firebase Auth** | User login (OTP-based for demo) |
| **Firestore** | Real-time app data (submissions, clusters, actions, conversations, documents). Includes native vector search for RAG. |
| **BigQuery** | Public dataset joins (Census, NFHS, DUSIB, CPCB, MPLADS). Analytical/historical data. |
| **Cloud Storage** | Voice notes, submitted photos, uploaded documents, generated PDFs/PPTX/DOCX |
| **Cloud Pub/Sub** | Internal event bus (submission → cluster → rank → notify) |
| **Cloud Functions** | Webhook receivers (WhatsApp, X, Reddit, widget, news, document upload) |
| **Cloud Scheduler** | Poll Reddit, news RSS, X streaming reconnect |
| **Gemini API** | Reasoning, classification, action-tagging, RAG answers, brief generation, letter drafting, document parsing |
| **Vertex AI** | Text embeddings (clustering + RAG retrieval), Vision (photo analysis), Document AI (structured PDF parsing when needed) |
| **Cloud Speech-to-Text** | Voice note transcription (Chirp model, Indian languages) |
| **Google Maps Platform** | Constituency map (Maps JavaScript API + Places for geocoding) |
| **Cloud Logging + Monitoring** | Ops observability (free tier fine) |

### 3.3 Frontend
- **Tailwind CSS** as utility layer. Configure with UX4G design tokens.
- **Radix UI primitives** for accessible base components (dialog, dropdown, tooltip, popover).
- **TanStack Query** for server state (Firestore listeners wrapped in queries).
- **Zustand** for local UI state (map filters, selected cluster, assistant conversation).
- **Recharts** for MPLADS gauges and trend charts. (Single choice; do not mix chart libraries.)
- **Google Maps JavaScript API** via `@vis.gl/react-google-maps` (actively maintained React wrapper).
- **next-intl** or `react-i18next` for English/Hindi UI switching.

### 3.4 Output generation
- **`pptxgenjs`** — PPTX file generation. Templates for briefing decks, meeting prep, District Collector presentations.
- **`docx`** — DOCX file generation. Policy summaries, formal letters.
- **`@react-pdf/renderer`** — PDF generation with React-based templates. MPLADS letters with official letterhead, briefing PDFs with embedded charts.
- All generated files stored in Cloud Storage with signed URLs (1-hour expiry).

### 3.5 Third-party (outside Google Cloud, must be justified)
- **Sarvam AI SDK** — mentioned in pitch as Indic-language fallback. Real integration for code-mixed voice notes. Show benchmark comparison in pitch deck.
- **`snoowrap`** — Reddit API wrapper. Zero cost.
- **`twitter-api-v2`** — X API wrapper. Pay-per-use as of Feb 2026 ($0.005/read).
- **`rss-parser`** — News RSS aggregation. Zero cost.

### 3.6 Testing
- **Vitest** for unit + integration tests.
- **Playwright** for E2E on the critical demo flow only. Don't over-invest.
- **High coverage target:** ranking module, MPLADS compliance module, RAG retrieval, PPTX/PDF generation. These are the "AI doing real work" surfaces where correctness matters most.

---

## 4. Repository structure

```
saarthi/
├── app/                              # Next.js 14 dashboard (frontend + BFF)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/                # Home: Today's Top 5, map
│   │   │   │   ├── cluster/[id]/             # Cluster detail
│   │   │   │   ├── category/[slug]/          # Category deep-dive
│   │   │   │   ├── assistant/                # Saarthi Assistant Q&A (also overlay)
│   │   │   │   ├── briefs/                   # Brief composer + history
│   │   │   │   ├── documents/                # Uploaded documents
│   │   │   │   ├── mplads/                   # MPLADS compliance
│   │   │   │   ├── live/                     # Live feed full-screen
│   │   │   │   ├── actions/                  # Action log
│   │   │   │   ├── staff/                    # Team & assignments
│   │   │   │   └── settings/
│   │   │   ├── onboarding/
│   │   │   └── api/
│   │   │       ├── clusters/
│   │   │       ├── submissions/
│   │   │       ├── actions/
│   │   │       ├── assistant/                # RAG endpoints
│   │   │       ├── briefs/                   # Generation endpoints
│   │   │       ├── documents/                # Upload + retrieval
│   │   │       ├── mplads/
│   │   │       └── ingest/
│   │   │           ├── whatsapp/
│   │   │           ├── twitter/
│   │   │           ├── reddit/
│   │   │           ├── widget/
│   │   │           └── news/
│   │   ├── components/                        # UX4G-derived UI
│   │   │   ├── priority-card/
│   │   │   ├── live-feed/
│   │   │   ├── map/
│   │   │   ├── evidence-drawer/
│   │   │   ├── metrics-strip/
│   │   │   ├── scope-toggle/
│   │   │   ├── action-composer/
│   │   │   ├── assistant/                    # Q&A drawer + full page
│   │   │   ├── brief-composer/               # Brief generation UI
│   │   │   └── document-uploader/
│   │   ├── lib/
│   │   │   ├── firebase.ts
│   │   │   ├── firestore.ts
│   │   │   ├── bigquery.ts
│   │   │   ├── gemini.ts
│   │   │   ├── maps.ts
│   │   │   ├── i18n.ts                       # English/Hindi
│   │   │   └── ux4g-tokens.ts
│   │   ├── types/
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── hi.json
│   │   └── hooks/
│   ├── public/
│   └── package.json
├── worker/                                    # Cloud Run ML pipeline worker
│   ├── src/
│   │   ├── ingest/                            # Normalize incoming from Pub/Sub
│   │   ├── enrich/                            # STT, image analysis, translation
│   │   ├── cluster/                           # Embed + cluster
│   │   ├── rank/                              # Score + rank clusters
│   │   ├── compliance/                        # MPLADS eligibility engine
│   │   ├── action-tag/                        # Determine action pathway
│   │   ├── assistant/                         # RAG retrieval + Gemini answer
│   │   ├── briefs/                            # PPTX/PDF/DOCX generation
│   │   ├── news-monitor/                      # RSS + web scraping ingestion
│   │   └── document-ingest/                   # PDF/DOCX parse + embed
│   └── package.json
├── functions/                                 # Firebase Cloud Functions (webhooks)
│   ├── whatsapp-webhook/
│   ├── twitter-poller/
│   ├── reddit-poller/
│   ├── news-poller/
│   ├── widget-endpoint/
│   └── document-upload/
├── data/
│   ├── constituencies/                        # Geo boundaries for New Delhi
│   ├── mplads/                                # Guidelines + permitted works list
│   ├── public/                                # Census, DUSIB, CPCB seed
│   ├── news-sources/                          # RSS feed list
│   ├── seed/                                  # Synthetic demo submissions
│   └── schemas/                               # Firestore +
 BigQuery schemas
├── infrastructure/
│   ├── terraform/                             # Optional: GCP resources as code
│   └── gcloud-setup.sh
├── docs/
│   ├── DESIGN_HANDOFF.md
│   ├── SITEMAP.md
│   ├── ENGINEERING_HANDOFF.md                 # this file
│   └── DEMO_SCRIPT.md
├── scripts/
│   ├── seed-firestore.ts
│   ├── seed-bigquery.ts
│   └── generate-demo-data.ts
├── .env.example
├── .gitignore
├── CLAUDE.md                                  # Persistent context for Claude Code
├── README.md
└── package.json                               # Root pnpm workspace
```

**Why monorepo:** shared TypeScript types between `app`, `worker`, and `functions`. Firestore document shapes must not drift between write and read sides. A single `types/` package prevents that.

---

## 5. High-level architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                        INTAKE CHANNELS                                │
│                                                                       │
│   Citizen: WhatsApp Bot ────┐                                         │
│           X Mentions ───────┤                                         │
│           Reddit Polls ─────┼──▶ Cloud Functions ──▶ Cloud Pub/Sub    │
│           Web Widget ───────┤       (webhooks)         (events)       │
│                             │                              │          │
│   Ambient: News RSS ────────┤                              │          │
│                             │                              │          │
│   MP/Staff: Documents ──────┘                              │          │
│           (PDF/DOCX)                                       │          │
│                                                            │          │
└────────────────────────────────────────────────────────────┼──────────┘
                                                             ▼
                                        ┌─────────────────────────────────────┐
                                        │      ML PIPELINE (Worker)           │
                                        │                                     │
                                        │  1. Enrich                          │
                                        │     ├─ STT (voice → text)           │
                                        │     ├─ Vision (photo → tags)        │
                                        │     ├─ Doc parse (PDF → text+images)│
                                        │     └─ Translate (any → English)    │
                                        │  2. Classify (Gemini Flash)         │
                                        │  3. Geolocate (NER + landmarks)     │
                                        │  4. Embed (Vertex embeddings)       │
                                        │  5. Cluster (semantic + geo + time) │
                                        │  6. Cross-ref public data (BigQuery)│
                                        │  7. MPLADS compliance check         │
                                        │  8. Rank + action-tag               │
                                        │  ─────────────────────────────────  │
                                        │  RAG (on demand):                   │
                                        │  9. Vector retrieval → Gemini Pro   │
                                        │                                     │
                                        │  Brief generation (on demand):      │
                                        │  10. Template + Gemini → PPTX/PDF   │
                                        │                                     │
                                        └────────────────┬────────────────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                              ┌──────────┐      ┌────────────────┐    ┌──────────┐
                              │Firestore │      │   BigQuery     │    │  Cloud   │
                              │ (realtime│      │ (analytical +  │    │ Storage  │
                              │ + vector)│      │ public data)   │    │(media +  │
                              │          │      │                │    │ outputs) │
                              └────┬─────┘      └───────┬────────┘    └────┬─────┘
                                   │                    │                  │
                                   └────────────────────┼──────────────────┘
                                                        │
                                                        ▼
                                       ┌───────────────────────────────────┐
                                       │  SAARTHI DASHBOARD (Next.js)      │
                                       │  Cloud Run · Firebase Auth        │
                                       │  6-role RBAC · English/Hindi UI   │
                                       │                                   │
                                       │  Real-time via Firestore listeners│
                                       │  Analytics via BigQuery API       │
                                       │  RAG via /api/assistant           │
                                       │  Generation via /api/briefs       │
                                       └───────────────────────────────────┘
```

---

## 6. Data model

### 6.1 Firestore collections

```typescript
// submissions/{submission_id}
{
  id: string;                              // "sub_2026_04812"
  source: "whatsapp" | "twitter" | "reddit" | "widget" | "portal" | "news" | "document";
  raw_text: string;
  translated_text: string;                 // always English for internal use
  original_language: string;               // "hi", "en", "hi-en", ...
  media: {
    voice_note_url?: string;
    photo_urls?: string[];
    transcription?: string;
    photo_tags?: string[];
    photo_captions?: string[];
  };
  document_ref?: string;                   // if source is "document", links to documents/{id}
  news_ref?: {                             // if source is "news"
    url: string;
    publication: string;
    published_at: Timestamp;
  };
  geo: {
    country: "IN";
    state: string;
    district: string;
    constituency: string;
    assembly?: string;
    ward?: string;
    locality?: string;
    lat?: number;
    lng?: number;
    confidence: number;
  };
  category: string;
  subcategory: string;
  urgency: "low" | "medium" | "high" | "critical";
  cluster_id?: string;
  credibility_score: number;
  is_political_noise: boolean;
  citizen_id?: string;                     // hashed, never displayed
  embedding: number[];                     // for vector search
  created_at: Timestamp;
  processed_at?: Timestamp;
}

// clusters/{cluster_id}
{
  id: string;
  title: string;                           // "Water shortage — Chandrapur Ward"
  title_hi: string;                        // Hindi title
  category: string;
  subcategory: string;
  geo: {
    constituency: string;
    ward: string;
    locality?: string;
    centroid: { lat: number; lng: number };
    bounding_box: [number, number, number, number];
  };
  urgency: "low" | "medium" | "high" | "critical";
  submission_ids: string[];
  submission_count: number;
  source_breakdown: {
    whatsapp: number;
    twitter: number;
    reddit: number;
    widget: number;
    portal: number;
    news: number;
    document: number;
  };
  trend: {
    current_week: number;
    previous_week: number;
    percent_change: number;
  };
  cross_reference: {
    dataset: string;                       // "Census-2011" | "NFHS-5" | ...
    metric: string;
    value: string;
    citation_url: string;
  }[];
  suggested_action: {
    type: "MPLADS" | "STATE" | "CENTRAL" | "COORDINATION";
    title: string;
    body: string;                          // draft letter body
    mplads_eligible: boolean;
    mplads_sector?: string;
    estimated_cost_lakhs?: number;
    compliance_notes: string[];
  };
  rank_score: number;                      // 0-100
  status: "new" | "reviewed" | "action_taken" | "resolved" | "snoozed";
  centroid_embedding: number[];            // for cluster matching
  created_at: Timestamp;
  updated_at: Timestamp;
}

// conversations/{conversation_id}  — Saarthi Assistant
{
  id: string;
  user_id: string;
  constituency: string;
  title: string;                           // AI-generated from first query
  messages: {
    role: "user" | "assistant";
    content: string;
    citations?: {                          // for assistant messages
      type: "cluster" | "submission" | "document" | "public_data";
      id: string;
      snippet: string;
      url?: string;
    }[];
    generated_at: Timestamp;
  }[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

// documents/{document_id}  — uploaded PDFs, reports, meeting notes
{
  id: string;
  uploaded_by: string;                     // user_id
  constituency: string;
  filename: string;
  original_url: string;                    // Cloud Storage signed URL
  file_type: "pdf" | "docx" | "txt";
  parsed_text: string;
  parsed_pages?: { page: number; text: string }[];
  extracted_entities: {
    people: string[];
    places: string[];
    organizations: string[];
    dates: string[];
    monetary_values: string[];
  };
  summary: string;                         // Gemini-generated
  category?: string;
  chunks: {                                // for RAG
    chunk_id: string;
    text: string;
    embedding: number[];
    page?: number;
  }[];
  visibility: "constituency" | "personal";
  created_at: Timestamp;
}

// briefs/{brief_id}  — generated outputs
{
  id: string;
  generated_by: string;                    // user_id
  constituency: string;
  type: "daily_briefing" | "meeting_prep" | "policy_summary" | "parliament_question" | "mplads_letter" | "cabinet_note";
  format: "pdf" | "pptx" | "docx";
  title: string;
  prompt: string;                          // user's ask, if any
  input_cluster_ids: string[];             // clusters included
  input_document_ids: string[];            // uploaded docs referenced
  output_url: string;                      // Cloud Storage
  output_size_bytes: number;
  status: "generating" | "ready" | "failed";
  created_at: Timestamp;
}

// actions/{action_id}
{
  id: string;
  cluster_id: string;
  type: "MPLADS_LETTER" | "STATE_LETTER" | "PARLIAMENT_QUESTION" | "MEETING" | "BRIEF_SHARED";
  status: "draft" | "sent" | "responded" | "completed";
  drafted_by: "ai" | "staff" | "mp";
  approved_by?: string;
  sent_to: string;
  sent_at?: Timestamp;
  response?: string;
  outcome?: "sanctioned" | "denied" | "underway" | "completed" | "no_response";
  document_url?: string;                   // generated brief/letter PDF
  audit_log: {
    timestamp: Timestamp;
    actor: string;
    event: string;
  }[];
}

// constituencies/{constituency_id}
{
  id: string;
  name: string;
  name_hi: string;
  state: string;
  district: string;
  mp: {
    name: string;
    handle_x?: string;
    email?: string;
  };
  boundaries_geojson_url: string;
  wards: {
    id: string;
    name: string;
    sc_majority: boolean;
    st_majority: boolean;
  }[];
  mplads: {
    allocation_annual: number;             // 50000000 (₹5 Cr)
    utilization_ytd: number;
    sc_percent_ytd: number;
    st_percent_ytd: number;
    fiscal_year: string;
  };
}

// users/{user_id}
{
  id: string;
  role: "mp" | "chief_of_staff" | "constituency_coordinator" | "field_worker" | "communications" | "observer";
  constituency: string;
  name: string;
  email: string;
  phone: string;
  language_preference: "en" | "hi";
  scope_restrictions?: {
    ward_ids?: string[];                   // field workers see only their wards
  };
  notification_prefs: {
    email_digest: "daily" | "weekly" | "off";
    urgent_alerts: boolean;
  };
  created_at: Timestamp;
  last_active: Timestamp;
}
```

### 6.2 BigQuery datasets

Same as v1 — see previous spec. Public data tables (`census_2011_wards`, `cpcb_air_quality`, `dusib_water_infrastructure`, `mplads_utilization`, `mplads_permitted_works`) plus `awaaz_analytics.cluster_history` renamed to `saarthi_analytics.cluster_history`.

**Why Firestore + BigQuery both:** Firestore for real-time UX (dashboard listeners, live feed, RAG vector search). BigQuery for the *ranking joins* against public datasets — that's where the AI does its heaviest lifting. This split itself is an architecture talking point (deployability score).

---

## 7. Ingestion pipeline (per channel)

### 7.1 WhatsApp
- Meta WhatsApp Business Cloud API
- Webhook: `POST /api/ingest/whatsapp` (verified via X-Hub-Signature)
- Conversation state in Firestore `whatsapp_sessions/{phone_hash}`
- Bot flow: language selection → free-form text/voice/photo → AI-inferred category confirmation → location capture → acknowledgment with tracking ID → publish `submission.created` to Pub/Sub

### 7.2 X / Twitter
- X API v2 pay-per-use tier
- Filtered stream: mentions of `@Saarthi_NewDelhi` handle + `@BansuriSwaraj` mentions with civic keywords
- Poller fallback if stream disconnects
- Cost estimate at pilot scale: ~$15–75/month per constituency
- Deduplication on tweet ID (24h window)

### 7.3 Reddit
- Public API via `snoowrap` (OAuth app)
- Poll every 5 min: `r/delhi`, `r/india`, `r/AskIndia`, `r/mumbai`
- Filter posts + top-level comments matching civic keywords + geographic mentions
- Zero cost

### 7.4 Widget
- `POST /api/ingest/widget` from embedded JS on partner sites (MP office websites, gov portals)
- Rate-limited by origin
- Accepts text, voice (base64), photo (upload to Cloud Storage first)

### 7.5 News monitoring (new in v2)
- RSS feeds from major Indian news sources (Hindustan Times Delhi, Times of India Delhi, Indian Express, Lokmat, The Hindu, PIB India)
- Poll every 15 min via `rss-parser`
- Gemini Flash filters for constituency relevance (mentions Delhi wards, MP name, category keywords)
- Each relevant article becomes a `submission` with `source: "news"`
- Note in submission body: article URL + publication + published date

### 7.6 Document upload (new in v2)
- `POST /api/documents/upload` from dashboard (Chief of Staff or MP uploads PDFs, meeting notes, department reports)
- Uploaded to Cloud Storage
- Gemini multimodal parses PDF → structured text + entity extraction
- Chunked into ~500-token pieces with embeddings for RAG
- Each chunk optionally becomes a `submission` if it references a specific issue/geography (opt-in)
- Documents themselves are queryable via Saarthi Assistant

### 7.7 Common enrichment (for all sources)
For every submission, in worker:
1. Language detection (Gemini or `cld3`)
2. Transcription if voice — Google STT (Chirp) with Sarvam AI fallback for code-mixed
3. Translation to English (Gemini for context)
4. Photo analysis — Vertex AI Vision / Gemini multimodal (category tags + severity)
5. Category + subcategory classification (Gemini Flash — cheap, fast)
6. Geolocation (NER + landmark matching + geocoding)
7. Political-noise / troll classification (Gemini)
8. Credibility scoring (source + account age + verified status + language quality)
9. Embedding via Vertex AI text-embedding-004 → stored on submission, indexed for vector search
10. Cluster assignment (cosine similarity + geo proximity + temporal window)
11. Cross-reference query (BigQuery join on public datasets)
12. Compliance tagging (MPLADS rules engine)
13. Rank scoring (weighted formula, §8.3)
14. Action tagging (Gemini determines MPLADS / State / Central / Coordination)
15. Write cluster back to Firestore, publish `cluster.updated`

---

## 8. AI / ML details

### 8.1 Clustering
- Embeddings: Vertex AI `text-embedding-004` (768-dim) or newest
- Distance: cosine
- Cluster assignment threshold: **cosine similarity > 0.82** AND **geographic proximity < 2km** AND **temporal window < 14 days**
- New cluster if no existing cluster meets threshold
- Cluster centroid = running mean of member embeddings
- Nightly recluster job merges/splits as needed

### 8.2 Cross-reference (BigQuery)
Per cluster, query relevant public tables based on category:
- `water` → `census_2011_wards` (household water access) + `dusib_water_infrastructure` (planned works)
- `health` → `census_2011_wards` (health facilities) + local datasets
- `air quality` → `cpcb_air_quality` (recent readings)
- All → `mplads_utilization` for the constituency

Result attached to cluster as `cross_reference` array with citation URLs.

### 8.3 Ranking formula (starting point — tune with real data)
```
rank_score = 
    0.35 * demand_signal        // log(submission_count) * source_diversity_bonus
  + 0.25 * public_data_severity // gap between citizen concern and public data
  + 0.15 * urgency              // AI-classified urgency
  + 0.10 * mplads_eligibility   // 1.0 if fully eligible, penalty otherwise
  + 0.10 * compliance_leverage  // helps close SC/ST gap
  + 0.05 * trend                // spike detection over last 7 days
```

Weights are config, not hardcoded. Every cluster stores its component scores for transparency.

### 8.4 MPLADS compliance engine
Rules to encode:
- **Permitted works list:** drinking water, education, electricity, non-conventional energy, healthcare/sanitation, irrigation, roads/pathways/bridges, sports, agriculture, self-help groups, urban development
- **Prohibited items:** office buildings, land acquisition, individual benefit assets, religious structures, personal-name assets
- **SC allocation ≥15%** of annual ₹5 Cr
- **ST allocation ≥7.5%** of annual ₹5 Cr
- **Non-lapsable:** unspent funds carry forward

When ranking suggests an MPLADS action:
- Verify eligibility against permitted list
- Flag compliance leverage (e.g., "helps close SC gap: current 8%, target 15%")
- Block recommendation if in prohibited list

### 8.5 Action tagging
Gemini determines the right pathway per cluster:
- **MPLADS** if eligible + local + within ₹5 Cr headroom
- **STATE** if requires state-scheme funding (larger, or state subject: health/education)
- **CENTRAL** if requires central ministry (railways, national highways, telecom)
- **COORDINATION** if requires multi-stakeholder (MLA + Collector + panchayat)

Each action tag includes suggested body text for the draft output.

### 8.6 Saarthi Assistant (RAG) — new in v2

**Purpose:** Answer natural-language questions from MP/staff over the entire constituency corpus.

**Corpus (retrieved at query time):**
- All submissions in scope (last N days or filtered)
- All cluster summaries + cross-references
- All uploaded documents (chunked with embeddings)
- Relevant BigQuery public data (Census, DUSIB, CPCB, MPLADS)

**Pipeline:**
1. User query embedded via Vertex AI text-embedding-004
2. Vector search in Firestore across `submissions`, `clusters` (centroid), `documents.chunks` — top K = 30 combined
3. Semantic re-ranking with Gemini Flash → top 12 most relevant chunks
4. Optionally: parallel BigQuery query if question is quantitative ("how many wards have <50% water access?")
5. Gemini 2.5 Pro receives: user query + top chunks + BigQuery result + conversation history → generates answer with inline citations
6. Every citation links back to source (cluster, submission, document page, or BigQuery row)
7. Conversation state stored in `conversations/{conversation_id}` — supports multi-turn

**UX:** Available as a persistent side drawer on every dashboard screen, plus full-page mode at `/assistant`.

**Example queries the demo must handle well:**
- "Show me only water issues in SC-majority wards where DUSIB has no planned works."
- "Which of my MPLADS recommendations from last quarter are still pending?"
- "Summarize the DUSIB report I uploaded yesterday and compare with citizen complaints."
- "What are my top 3 issues by trend acceleration this week?"

### 8.7 Brief Generation — new in v2

**Purpose:** One-click generation of formal outputs — briefings, meeting prep, letters, policy summaries.

**Output types:**
| Type | Format | Template |
|---|---|---|
| Daily Briefing | PDF | 5-page: top 5 issues + charts + recommended actions |
| Meeting Prep (District Collector) | PPTX | 8–10 slides: agenda, per-issue detail with map, ask |
| MPLADS Recommendation Letter | PDF | Official letterhead + evidence attachments |
| Parliament Question | DOCX | Question Hour format with references |
| Policy Summary | DOCX | 2-page executive summary on a category |
| Cabinet Note (future) | DOCX | Pitch-only for now |

**Pipeline:**
1. User selects type + provides brief prompt ("prep me for tomorrow's meeting with the DUSIB commissioner")
2. Worker retrieves relevant clusters + documents + public data
3. Gemini Pro generates structured JSON matching the template schema
4. Template renderer (pptxgenjs / react-pdf / docx) produces file
5. File uploaded to Cloud Storage; signed URL returned
6. Brief record stored in `briefs/{brief_id}` with input references (for auditability)

**Design principle:** every generated brief cites its sources. No hallucinated statistics. If Gemini can't cite it, don't include it.

### 8.8 Model choice matrix

| Task | Model | Rationale |
|---|---|---|
| Voice transcription | Google Cloud STT (Chirp) | Best on Indian languages, brief-mandated |
| Code-mixed voice fallback | Sarvam AI | Better on Hinglish |
| Category classification | Gemini 2.5 Flash | High volume, cheap, fast |
| Political-noise filter | Gemini 2.5 Flash | High volume |
| Photo analysis | Gemini 2.5 (multimodal) or Vertex AI Vision | Multimodal for description, Vision for structured tags |
| Embedding | Vertex AI text-embedding-004 | Standard, integrates with Firestore vector |
| Cluster naming | Gemini 2.5 Flash | Short generation |
| RAG answer generation | Gemini 2.5 Pro | Deep reasoning, long context, best citation adherence |
| Brief generation | Gemini 2.5 Pro | Same |
| Letter drafting | Gemini 2.5 Pro | Tone and format matter |
| Translation | Gemini 2.5 Flash | Cheaper than Cloud Translation API at our volume, better context |

---

## 9. API surface

### 9.1 App / dashboard API
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/clusters` | List clusters (filter by category, urgency, status, scope) |
| GET | `/api/clusters/[id]` | Cluster detail |
| PATCH | `/api/clusters/[id]/status` | Update status |
| GET | `/api/submissions/[id]` | Submission detail |
| POST | `/api/actions` | Create draft action |
| POST | `/api/actions/[id]/send` | Approve + send (generates final doc, marks sent) |
| GET | `/api/mplads/summary` | Utilization + compliance |
| GET | `/api/mplads/eligibility?work_type=x` | Eligibility check |
| GET | `/api/live-feed` | SSE stream of new submissions/clusters |
| POST | `/api/assistant/query` | Q&A (multi-turn) — returns answer with citations |
| GET | `/api/assistant/conversations` | List user's conversations |
| GET | `/api/assistant/conversations/[id]` | Conversation history |
| DELETE | `/api/assistant/conversations/[id]` | Delete conversation |
| POST | `/api/briefs/generate` | Generate brief (async, returns brief_id) |
| GET | `/api/briefs/[id]` | Brief status + download URL |
| GET | `/api/briefs` | List user's briefs |
| POST | `/api/documents/upload` | Upload doc (multipart) |
| GET | `/api/documents` | List constituency documents |
| GET | `/api/documents/[id]` | Doc metadata + summary |

### 9.2 Ingest API (public webhooks)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/ingest/whatsapp` | Meta Cloud API webhook |
| POST | `/api/ingest/twitter` | X streaming webhook |
| POST | `/api/ingest/reddit` | Reddit poller push |
| POST | `/api/ingest/widget` | Embedded widget submissions |
| POST | `/api/ingest/news` | News RSS poller push |

All webhooks verify signatures where the platform supports it. Rate-limited by IP and origin.

---

## 10. Frontend integration with design session

**Contract:**
- Design produces `design-tokens.json` (colors, spacing, typography, radii) — engineering imports into `tailwind.config.ts`
- Design produces Figma specs for each component in `DESIGN_HANDOFF.md` §7
- Engineering implements matching the spec
- Deviations require sync
- Component prop shapes are engineering's call; visual spec is design's

**Skeleton components to scaffold first** (in this order):
1. `<PriorityCard />` — most-used, blocks everything else
2. `<ConstituencyMap />` — integration-heavy, build early with placeholder data
3. `<MetricsStrip />` — top of dashboard, simple
4. `<EvidenceDrawer />` — right rail
5. `<AssistantDrawer />` — Q&A drawer, high demo impact
6. `<LiveSignalFeed />` — bottom
7. `<ScopeToggle />` — top-right
8. `<BriefComposer />` — brief generation UI

Build functional-first with default styling; restyle when tokens land.

### Internationalization — first-class, not afterthought

Many MP staff (constituency coordinators, field workers) are not English-fluent. Hindi is not a v2 upgrade — it must be first-class from Phase 1.

- Every user-facing string in `locales/en.json` and `locales/hi.json`
- Language switcher in header, persisted to user profile
- Date/number formatting locale-aware (Indian numerals: ₹1,00,000)
- Devanagari script needs ~15% more vertical space — test all layouts with Hindi headings
- No text truncation mid-conjunct

---

## 11. Public data sources & seed data

### 11.1 Real public data to load into BigQuery
| Dataset | Source | Loading approach |
|---|---|---|
| Census 2011 ward data | data.gov.in | CSV → BigQuery load job |
| CPCB Air Quality (Delhi) | CPCB open data | Daily API pull, backfill 90 days for demo |
| DUSIB water infrastructure | delhi.gov.in | Manual CSV curation for pilot wards |
| MPLADS utilization (New Delhi LS) | mplads.mospi.gov.in | Scrape → CSV → BigQuery |
| MPLADS permitted works | Official guidelines | Manual JSON curation |
| Constituency boundaries GeoJSON | ECI / DataMeet | Load into Firestore + Maps |

### 11.2 Synthetic seed data for demo
- **~250 synthetic citizen submissions** across all channels, spread over 30 simulated days
- Realistic source mix: 50% WhatsApp, 20% X, 12% Reddit, 8% widget, 7% news, 3% document
- Language mix: 45% Hindi, 30% English, 25% code-mixed
- Category mix: 45% water, 25% health/air, 20% infrastructure, 10% other
- Cluster into ~35 clusters (some large, most small), with clear top-5 mapping to real Delhi ward issues
- Generate via Gemini with careful prompt — save as `data/seed/submissions.json`
- **~5 uploaded documents** for the RAG demo: DUSIB report, CPCB quarterly summary, one Parliament Question response, one meeting minutes, one department circular
- **~15 news articles** already ingested from real Delhi news sources (redacted or paraphrased if licensing is a concern)

**Live-demo cluster:** one cluster pre-seeded with 12 submissions that will receive a live X mention during the demo, pushing it to top rank. Coordinate this X post in advance.

---

## 12. Development phases

### Phase 1 — Foundation (Day 1)
- [ ] Repo scaffolded per §4
- [ ] `pnpm workspaces` set up
- [ ] Next.js app running locally
- [ ] Firebase project + Firestore, Auth, Storage enabled
- [ ] GCP project + service accounts + BigQuery dataset
- [ ] `.env.example` documented
- [ ] `CLAUDE.md` created
- [ ] Constituency data loaded (New Delhi LS boundaries + wards)
- [ ] i18n scaffolded (en/hi)

### Phase 2 — Ingest & enrichment (Day 2)
- [ ] WhatsApp webhook receiving test messages
- [ ] Reddit poller live
- [ ] X API poller live (mock fallback for offline dev)
- [ ] News RSS poller live
- [ ] Widget endpoint + basic JS embed
- [ ] Worker: STT, Vision, category classifier
- [ ] Publish to Pub/Sub → worker consumes
- [ ] Submissions writing to Firestore

### Phase 3 — Clustering & ranking (Day 3)
- [ ] Embeddings via Vertex AI
- [ ] Clustering logic (cosine + geo + temporal)
- [ ] BigQuery public data loaded (Census + CPCB + MPLADS)
- [ ] Cross-reference joins working
- [ ] MPLADS compliance engine
- [ ] Ranking formula → top-N clusters surface correctly on synthetic data

### Phase 4 — Dashboard + Assistant (Day 4)
- [ ] Auth flow (OTP login)
- [ ] Dashboard shell with map + rails + "Today's Top 5"
- [ ] Priority Card component
- [ ] Live Feed with Firestore realtime listener
- [ ] Cluster detail page
- [ ] MPLADS page with compliance gauges
- [ ] **Saarthi Assistant Q&A drawer working end-to-end** (Firestore vector retrieval → Gemini Pro → cited answer)
- [ ] Document upload + parse working

### Phase 5 — Brief generation + polish (Day 5)
- [ ] Action Composer with MPLADS letter generation (PDF)
- [ ] Daily Briefing PDF generation
- [ ] Meeting Prep PPTX generation
- [ ] Role model + Firestore security rules
- [ ] Seed data loaded, dashboard populated realistically
- [ ] Demo flow scripted and rehearsed
- [ ] Demo video recorded
- [ ] Deployed to Cloud Run
- [ ] README polished
- [ ] Pitch deck cross-referenced with features

**If time is short, cut in this order:** Cabinet Note template → PPTX (fallback to PDF only) → Full onboarding wizard → Staff Management screen → Category deep-dive → Live Feed full-screen mode. 

**Never cut:** Priority Card · Map · Cluster Detail · MPLADS view · MPLADS letter generation · Saarthi Assistant Q&A · at least one brief format (PDF Daily Briefing).

---

## 13. Demo readiness checklist (5-min video storyboard)

Every beat has an engineering requirement. Build for the demo first, extras later.

**Beat 1 — Opening (30s):** Problem framing. Statistics: MPLADS underutilization (CAG: 49–90%). "MPs receive fragmented info from citizens, news, reports, and social media. No time to sort it. No way to act on it."

**Beat 2 — Ingest in action (45s):** Show a Hindi WhatsApp voice note arriving → auto-transcribed, categorized, geolocated → appears live on the dashboard. Simultaneously, a news article about the same issue ingests from RSS. Same cluster grows in real time.

**Beat 3 — Executive briefing (60s):** MP's Monday morning. "Today's Top 5 Issues" ranked in the left rail. Map shows hotspots. Metrics strip: MPLADS at 62% utilization, SC allocation at 11% (below 15% target — alert). MP clicks top issue → evidence drawer opens with citizen voices, news mentions, Census cross-reference.

**Beat 4 — Saarthi Assistant (NEW hero moment, 60s):** MP opens assistant drawer. Types: *"Show me water issues in SC-majority wards where DUSIB has no planned works."* Saarthi returns: 4 clusters, ranked by demand, each with citations to submissions + DUSIB gap data. Follow-up: *"Which of these could I fund with MPLADS to help my SC allocation?"* Saarthi answers with a ranked list + eligibility check.

**Beat 5 — Live moment (30s):** Live X post from a teammate → dashboard flashes. New signal on existing cluster. Rank moves up.

**Beat 6 — One-click action + brief (60s):** MP clicks "Generate MPLADS letter" on top cluster → PDF letter appears with citations, compliance notes ("helps close SC gap"), draft body. MP clicks "Generate meeting prep for tomorrow's DUSIB commissioner meeting" → PPTX with 8 slides downloads. Both files open, look real, look sharp.

**Beat 7 — Replicability + Close (30s):** Toggle scope: Constituency → District → State. Same UI, expanded data. "543 MPs. 28 states. Config change, not rewrite. Built on Google Cloud." Vision line.

---

## 14. Security, privacy, compliance

- **Never display raw citizen phone numbers or usernames on the dashboard's ranking view.** They live in the evidence drawer only, gated by explicit interaction.
- **Hash citizen identifiers** (WhatsApp phone, X handle) with per-constituency salt.
- **Voice note, photo, and document URLs are signed URLs** with 1-hour expiry.
- **Firestore security rules:** role-based per §15. Cross-constituency reads blocked at rule level.
- **Political-noise flag** filters items from ranking but retains them (audit/compliance) — never deleted based on political content.
- **Rate-limit all ingest endpoints** — 100 submissions/min per IP for widget, 10/min per phone for WhatsApp.
- **Right-to-deletion:** cascade delete from Firestore + Cloud Storage on request.
- **No API keys client-side.** All Gemini / Vertex calls go through Next.js API routes.
- **Uploaded documents** default to `visibility: "personal"` — only owner can access. Sharing to constituency scope is an explicit action.
- **Saarthi Assistant citations** must resolve to real, retrievable source records. No hallucinated citations.

---

## 15. Role & permissions model (new in v2)

Six roles, mapped to how Indian MP offices actually staff. Firestore security rules enforce these; UI hides/disables actions per role.

| Role | Firestore Access | UI Actions |
|---|---|---|
| **`mp`** | Full read/write on constituency scope | All actions: approve/send letters, sanction MPLADS recommendations, mark actions closed, delete conversations, upload docs, generate briefs |
| **`chief_of_staff`** | Full read; write on drafts + assignments; no send-approval | Draft letters/briefs, assign tasks, mark actions in-progress, upload docs, add MP-review notes, use Assistant |
| **`constituency_coordinator`** | Read constituency-wide; write on ground-truth updates | Update cluster status ("verified on ground"), escalate hotspots, add notes to submissions, use Assistant |
| **`field_worker`** | Read-only, ward-scoped (via `scope_restrictions.ward_ids`) | Mark clusters as "verified" / "needs re-inspection" — future mobile UI |
| **`communications`** | Read all + write on social/comms tab | Draft public responses (not sent from Saarthi directly), tag media-attention issues, monitor sentiment. Assistant access. |
| **`observer`** | Read-only, no scope restrictions | For interns, party workers, journalists with temp access. No writes. |

**Field-worker mobile view:** structural v1 (auth + data model + a minimal `/mobile/ward/[id]` route) but full mobile UX polish is post-hackathon. The MP office reality is that field workers exist — designing them out of the system would be a scoping error even if the mobile UI ships later.

**Cabinet Ministers:** not built as a role in v1. In pitch: "the same 6-role model extends to Cabinet Minister secretariats with an added `pa`/`aps`/`private_secretary` civil-service tier."

---

## 16. Vaishu flow diagram — future state

The uploaded flow diagram (approval chain → officer dashboard → work-in-progress → citizen close-loop → archive analytics) is our **roadmap slide**, not v1.

V1 ships: citizen intake → AI processing → issue ticket → MP dashboard → briefing + Q&A → drafted output (letter/PDF/PPTX).

Post-hackathon expansion: officer dashboard, delegation, work-in-progress updates, citizen confirmation, archive analytics feeding better governance metrics.

Slide it into the pitch deck (slide 9 or 10) as "The full accountability loop — where Saarthi goes next."

---

## 17. Environment setup

### 17.1 Required accounts / keys
- Google Cloud project with billing enabled ($300 free credit)
- Firebase project (linked to same GCP project)
- APIs to enable: Firestore, Firebase Auth, Cloud Storage, Cloud Functions, Cloud Run, Pub/Sub, BigQuery, Cloud Speech-to-Text, Vertex AI, Maps JavaScript API, Places API, Document AI
- Meta Developer + WhatsApp Business Cloud API
- X Developer account (pay-per-use)
- Reddit Developer account (free)
- Sarvam AI account (₹1000 free credits)

### 17.2 Local dev commands
```bash
pnpm install
cp .env.example .env.local          # Edit with keys
pnpm firebase emulators:start        # Firestore + Auth emulators
pnpm --filter app dev                # Dashboard
pnpm --filter worker dev             # ML pipeline
pnpm --filter functions serve        # Cloud Functions local
pnpm seed:firestore
pnpm seed:bigquery
pnpm test
pnpm test:e2e
```

### 17.3 Deployment
```bash
gcloud run deploy saarthi-app --source app/
gcloud run deploy saarthi-worker --source worker/
pnpm firebase deploy --only functions
```

---

## 18. Coordination with design session

- **Shared source of truth:** `SITEMAP.md` and this file. If either drifts, sync immediately.
- **Blockers:** if design hasn't produced tokens by Day 4 morning, ship with a placeholder token file. Don't block engineering.
- **Component contracts:** engineering owns prop shape and behavior; design owns visual spec. Agree on both before implementation.
- **Two new components not in original design brief:** `<AssistantDrawer />` and `<BriefComposer />`. Coordinate quickly on these — they're key demo surfaces.

---

## 19. First moves for Claude Code

When Claude Code opens this repo:

1. Read `DESIGN_HANDOFF.md`, `SITEMAP.md`, and this file end-to-end.
2. Create `CLAUDE.md` at the repo root with a distilled context (product mission, tech stack, key decisions) — the persistent context for future sessions.
3. Scaffold the monorepo structure in §4.
4. Set up `.env.example` with every key documented.
5. Initialize Firestore + BigQuery schemas.
6. Load constituency data (New Delhi LS boundaries + wards).
7. **Get the WhatsApp webhook receiving test messages before any dashboard UI work.** Data flow before UI polish. Always.
8. Get one cluster end-to-end (submission → embed → cluster → rank → visible in Firestore) before scaffolding Assistant or brief generation.

**Order-of-operations principle:** land the *data flow* before *UI polish*, and land *core loop* (intake → cluster → rank → action) before *advanced features* (Assistant, briefs). A dashboard with real ingested data + one working brief format is 10x more impressive than a beautiful UI with fake data and broken generation.

---

## 20. Rubric traceability

| Feature | Rubric criterion | Weight |
|---|---|---|
| Real ingestion from 6 channels (WhatsApp, X, Reddit, widget, news, documents) | AI/Technical Execution | 25% |
| BigQuery cross-reference against public datasets | AI/Technical Execution | 25% |
| Clustering + ranking + MPLADS compliance engine | AI/Technical Execution | 25% |
| **Saarthi Assistant (RAG over full corpus)** | AI/Technical Execution | 25% |
| **Real PDF/PPTX/DOCX generation with cited evidence** | AI/Technical Execution | 25% |
| Multi-tenant hierarchical data model + scope toggle | Deployability & Scalability | 25% |
| GCP-only stack, standard managed services, Cloud Run deploy | Deployability & Scalability | 25% |
| 6-role RBAC modeled on real Indian MP office structure | Deployability & Scalability | 25% |
| WhatsApp intake, 22-language support, voice + photo | Inclusivity & Accessibility | 15% |
| **Hindi UI as first-class (not afterthought)** | Inclusivity & Accessibility | 15% |
| UX4G design system adoption + accessibility base | Inclusivity & Accessibility | 15% |
| MPLADS compliance built in, action-tagged recommendations | Problem-Solution Fit | 20% |
| Applicable to 543 MPs + Cabinet Ministers by config | Impact Potential | 10% |
| Government-style UI, non-technical user grasps in 5 min | Presentation & Clarity | 5% |

If a line of code doesn't trace to at least one of these, question whether it belongs in v1.

---

## Changelog

- **v2 (2026-07-02):** Post-pivot. Renamed Awaaz → Saarthi. Vision broadened to executive intelligence. Added: Saarthi Assistant (RAG), Brief Generation (PPTX/PDF/DOCX), news monitoring, document upload, 6-role RBAC, Hindi UI as first-class, mobile field-worker scaffolding. Demo storyboard rewritten. Vaishu flow diagram framed as roadmap.
- **v1 (2026-07-02):** Initial engineering handoff. Tech stack locked. Data model drafted.
