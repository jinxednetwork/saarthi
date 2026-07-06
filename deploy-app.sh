#!/usr/bin/env bash
# Deploy the Saarthi MP dashboard + API to Cloud Run (from the Dockerfile).
# Run from the repo root:  bash deploy-app.sh
set -euo pipefail

GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"
PROJECT="saarthi-501522"
REGION="asia-south1"
SA="firebase-app-hosting-compute@saarthi-501522.iam.gserviceaccount.com"

ENV_VARS="GOOGLE_VERTEX_PROJECT=${PROJECT},GOOGLE_VERTEX_LOCATION=us-central1,FIREBASE_PROJECT_ID=${PROJECT}"

# Maps browser key: read from the gitignored app/.env.local so the AIza... key
# never lands in the (public) repo. Absent → the dashboard uses the Leaflet
# fallback. The key is referrer-restricted, so exposing it in the browser is safe.
MAPS_KEY="$(grep -E '^GOOGLE_MAPS_API_KEY=' app/.env.local 2>/dev/null | head -1 | cut -d= -f2- || true)"
if [ -n "${MAPS_KEY:-}" ]; then
  ENV_VARS="${ENV_VARS},GOOGLE_MAPS_API_KEY=${MAPS_KEY}"
  echo "Maps key found — deploying with Google Maps enabled."
else
  echo "No Maps key in app/.env.local — deploying with the Leaflet fallback."
fi

"$GCLOUD" run deploy saarthi-app \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --service-account "$SA" \
  --set-env-vars "$ENV_VARS" \
  --memory 1Gi --cpu 1 --port 8080
