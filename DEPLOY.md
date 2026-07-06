# Deploying Saarthi to Google Cloud

Two Next.js apps ship to **Firebase App Hosting** (Google's Git-native Next.js
hosting), backed by **Firestore**, with **Gemini running on Vertex AI**. No API
keys in production — everything authenticates through the runtime service
account (ADC). This is the recommended path; a **Cloud Run** fallback is at the
bottom.

- `app` (`@saarthi/app`) — MP dashboard **+ the shared `/api` (tickets, intake, assistant, docs)**
- `citizen` (`@saarthi/citizen`) — standalone Citizen Portal; talks to the app's API

The repo is a **pnpm monorepo**; both apps consume `@saarthi/shared` as source.

> **How the AI backend is chosen** (`app/src/lib/ai/gemini.ts`): if
> `GOOGLE_VERTEX_PROJECT` or `GOOGLE_CLOUD_PROJECT` is set → **Vertex AI via
> ADC** (no key). Else if `GOOGLE_GENERATIVE_AI_API_KEY` is set → AI Studio key.
> Else → the offline scripted brain. App Hosting and Cloud Run both inject
> `GOOGLE_CLOUD_PROJECT`, so **Vertex activates automatically in production.**

---

## 0. One-time project setup (you run these — interactive)

Project already in use for local dev: **`saarthi-501522`** (account
`ianalmeida2000@gmail.com`). Reuse it or pick another with billing enabled
(App Hosting + Firestore + Vertex need the Blaze plan; free tiers are generous).

```bash
npm i -g firebase-tools
firebase login                                   # opens a browser
firebase use saarthi-501522

# Enable the three APIs the app calls at runtime:
gcloud services enable \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  --project saarthi-501522
```

Create the Firestore database once (Native mode, **Mumbai** for an India app):

```bash
gcloud firestore databases create --location=asia-south1 --project saarthi-501522
```

> Local dev tip: the same two APIs + database make `SAARTHI` hit **real** Vertex
> and Firestore from your laptop (ADC from `gcloud auth application-default
> login`). Until they're enabled, the app degrades cleanly to the in-memory
> stores and still uses Vertex for AI once `aiplatform` is on.

---

## 1. Grant the runtime service account access (Vertex + Firestore)

> **Run this AFTER step 2**, not before. App Hosting's runtime service account
> is created together with the first backend — it does not exist until then.
> (Grant it once; both backends share it.)

App Hosting runs each backend as a Google-managed service account. Discover its
exact email, then grant the two roles the app needs:

```bash
PROJECT=saarthi-501522
SA=$(gcloud iam service-accounts list --project $PROJECT \
  --filter="email~apphosting OR email~app-hosting" --format="value(email)" | head -1)
echo "App Hosting SA: $SA"          # e.g. firebase-app-hosting-compute@saarthi-501522.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:${SA}" --role="roles/aiplatform.user"
gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:${SA}" --role="roles/datastore.user"
```

That's the whole "secret" story — there is no Gemini key to manage. (An AI
Studio key remains an optional fallback: create a `gemini-api-key` secret and
uncomment the block in `app/apphosting.yaml`.)

---

## 2. Deploy the MP dashboard + API backend

App Hosting connects to **this GitHub repo** and auto-builds on push.

```bash
firebase apphosting:backends:create --project saarthi-501522
# When prompted:
#   • connect GitHub → jinxednetwork/saarthi
#   • live branch    → main
#   • root directory → app
#   • backend id     → saarthi-app
```

`app/apphosting.yaml` sets `GOOGLE_VERTEX_LOCATION=us-central1`; the project id
arrives via the injected `GOOGLE_CLOUD_PROJECT`, so Gemini runs on Vertex and
Firestore activates — both via ADC, no key. Run the step-1 IAM grants now that
the SA exists. It builds and gives you a URL like
`https://saarthi-app--saarthi-501522.web.app`. **Copy that URL.**

---

## 3. Deploy the Citizen Portal backend

Put the app URL from step 2 into `citizen/apphosting.yaml`
(`NEXT_PUBLIC_SAARTHI_API_URL`), commit, push. Then:

```bash
firebase apphosting:backends:create --project saarthi-501522
#   • root directory → citizen
#   • backend id     → saarthi-citizen
```

You now have two live links — the MP dashboard and the citizen portal — sharing
one Firestore.

**CORS:** the tickets API already returns `Access-Control-Allow-Origin: *`, so the
separately-hosted portal can post to it cross-origin.

---

## 4. Redeploys

Just `git push` to `main` — App Hosting rebuilds both backends automatically.

---

## Cloud Run fallback (if the App Hosting monorepo build gives trouble)

Both apps have a `Dockerfile` that builds the whole workspace and runs the
Next.js standalone server. Cloud Run also injects `GOOGLE_CLOUD_PROJECT`, so
Vertex + Firestore work via ADC — grant the same two roles to the Cloud Run
service account.

```bash
gcloud config set project saarthi-501522
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# MP dashboard + API  (build from repo root; the Dockerfile copies the workspace)
gcloud run deploy saarthi-app --source . --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_VERTEX_LOCATION=us-central1

# Citizen portal
gcloud run deploy saarthi-citizen --source . --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SAARTHI_API_URL=<app-run-url>
```

Grant the Cloud Run runtime SA `roles/aiplatform.user` + `roles/datastore.user`
(the default compute SA is `PROJECT_NUMBER-compute@developer.gserviceaccount.com`).

> The `Dockerfile` builds a specific app with `--build-arg APP=app|citizen`. With
> `--source .` Cloud Run uses the root `Dockerfile`; set `APP` per service via a
> `cloudbuild.yaml` or build the images directly with
> `docker build --build-arg APP=citizen`.

---

## What runs where

| Service | Google product | Notes |
| --- | --- | --- |
| `app`, `citizen` | Firebase App Hosting (or Cloud Run) | Next.js SSR, standalone output |
| tickets / intake / signals | Firestore | auto via ADC (`roles/datastore.user`) |
| Gemini (assistant, intake, media, translate) | **Vertex AI** | auto via ADC (`roles/aiplatform.user`), no key |
| public datasets | BigQuery | future (curated seed today) |
| intake pipeline | Cloud Run | the `worker` package |
