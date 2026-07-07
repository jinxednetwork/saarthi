#!/usr/bin/env bash
# Deploy the Saarthi MP dashboard + API to Cloud Run (from the Dockerfile).
# Run from the repo root:  bash deploy/deploy-app.sh
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

# WhatsApp Business Cloud API: same gitignored-local-file pattern as the Maps
# key above, so the four secrets never land in the (public) repo.
for VAR in WHATSAPP_VERIFY_TOKEN WHATSAPP_ACCESS_TOKEN WHATSAPP_PHONE_NUMBER_ID WHATSAPP_APP_SECRET; do
  VAL="$(grep -E "^${VAR}=" app/.env.local 2>/dev/null | head -1 | cut -d= -f2- || true)"
  if [ -n "${VAL:-}" ]; then
    ENV_VARS="${ENV_VARS},${VAR}=${VAL}"
  fi
done
if grep -qE '^WHATSAPP_ACCESS_TOKEN=.+' app/.env.local 2>/dev/null; then
  echo "WhatsApp credentials found — deploying with the /api/ingest/whatsapp webhook enabled."
else
  echo "No WhatsApp credentials in app/.env.local — webhook will reject Meta's verification handshake."
fi

"$GCLOUD" run deploy saarthi-app \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --service-account "$SA" \
  --set-env-vars "$ENV_VARS" \
  --memory 1Gi --cpu 1 --port 8080
