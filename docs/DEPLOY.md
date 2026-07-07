# Deploying Saarthi to Google Cloud

Both Next.js apps run on **Cloud Run** (built from the root `Dockerfile`), with
**Gemini on Vertex AI** and **Firestore** — all authenticated by the runtime
service account (ADC), no API keys in production.

- `app` (`@saarthi/app`) — MP dashboard **+ the shared `/api` (tickets, intake, assistant, docs)**
- `citizen` (`@saarthi/citizen`) — standalone Citizen Portal; posts to the app's API

**Live now:**
| Service | URL |
| --- | --- |
| MP dashboard + API | https://saarthi-app-353201937460.asia-south1.run.app |
| Citizen portal | https://saarthi-citizen-353201937460.asia-south1.run.app |

> **Why Cloud Run, not Firebase App Hosting?** App Hosting's buildpack only
> supports Nx/Turborepo monorepos — it can't build a plain pnpm workspace
> (`Missing dependency lock file at path '/workspace/app'`). Cloud Run builds
> from our `Dockerfile`, which installs the whole workspace and emits the Next
> standalone server. (Firebase is still used for Firestore.)

> **How the AI backend is chosen** (`app/src/lib/ai/gemini.ts`): if
> `GOOGLE_VERTEX_PROJECT` / `GOOGLE_CLOUD_PROJECT` is set → **Vertex AI via ADC**
> (no key). Else `GOOGLE_GENERATIVE_AI_API_KEY` → AI Studio key. Else → the
> offline scripted brain. The deploy scripts set `GOOGLE_VERTEX_PROJECT`, so
> Vertex is always used in production.

---

## 0. One-time project setup (already done for saarthi-501522)

```bash
# gcloud + ADC
gcloud auth login
gcloud auth application-default login
gcloud config set project saarthi-501522

# Firebase on the GCP project (needed for Firestore management)
firebase login
firebase projects:addfirebase saarthi-501522

# APIs
gcloud services enable \
  aiplatform.googleapis.com firestore.googleapis.com \
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  --project saarthi-501522

# Firestore database (Native, Mumbai) + locked-down rules
gcloud firestore databases create --location=asia-south1 --project saarthi-501522
firebase deploy --only firestore:rules --project saarthi-501522
```

### IAM (two service accounts)

```bash
PROJECT=saarthi-501522

# Runtime SA (Cloud Run) — Vertex + Firestore
RUN_SA="firebase-app-hosting-compute@${PROJECT}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:${RUN_SA}" --role="roles/aiplatform.user"
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:${RUN_SA}" --role="roles/datastore.user"

# Build SA (Cloud Build runs as the Compute Engine default SA on new projects)
BUILD_SA="$(gcloud projects describe $PROJECT --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:${BUILD_SA}" --role="roles/cloudbuild.builds.builder"
```

(`deploy/grant-build-perms.sh` does that last one.)

---

## 1. Deploy — two scripts from the repo root

```bash
bash deploy/deploy-app.sh        # MP dashboard + API → Cloud Run (uses --source + Dockerfile)
bash deploy/deploy-citizen.sh    # Citizen portal → Cloud Run (bakes the app URL in at build)
```

- **`deploy/deploy-app.sh`** runs `gcloud run deploy saarthi-app --source .`; the root
  `Dockerfile` (APP defaults to `app`) builds and deploys. Sets
  `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`, `FIREBASE_PROJECT_ID`.
- **`deploy/deploy-citizen.sh`** builds via `deploy/cloudbuild-citizen.yaml` (passing
  `--build-arg NEXT_PUBLIC_SAARTHI_API_URL=<app url>`, which `next build`
  inlines) then deploys the image. Edit `API_URL` in the script if the app URL
  changes.

**CORS:** the tickets API returns `Access-Control-Allow-Origin: *`, so the
separately-hosted portal posts to it cross-origin.

---

## 2. Redeploys

Re-run the relevant script — `bash deploy/deploy-app.sh` / `bash deploy/deploy-citizen.sh`.
(No Git-push auto-deploy; Cloud Run builds from your local working tree via
`--source` / `builds submit`.)

To wire continuous deployment later, add a Cloud Build trigger on the GitHub
repo that runs the same Docker builds and `gcloud run deploy --image` on push.

---

## What runs where

| Service | Google product | Notes |
| --- | --- | --- |
| `app`, `citizen` | Cloud Run | Next.js standalone in Docker (root `Dockerfile`, `--build-arg APP=`) |
| tickets / intake / signals | Firestore (asia-south1) | auto via ADC (`roles/datastore.user`) |
| Gemini (assistant, intake, media) | Vertex AI | auto via ADC (`roles/aiplatform.user`), no key |
| container builds | Cloud Build + Artifact Registry | `roles/cloudbuild.builds.builder` on the compute SA |
| public datasets | BigQuery | future (curated seed today) |
