#!/usr/bin/env bash
# One-time: enable the Maps JavaScript API and mint a browser-restricted API key
# for the dashboard map. The key is safe to expose in the browser (that's how
# Maps JS works); it's locked to the Maps JS API and to our two origins.
# Run from the repo root:  bash deploy/setup-maps-key.sh
set -euo pipefail

GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"
PROJECT="saarthi-501522"
APP_URL="https://saarthi-app-353201937460.asia-south1.run.app"

echo "1/2  Enabling Maps JavaScript API ..."
"$GCLOUD" services enable maps-backend.googleapis.com --project "$PROJECT"

echo "2/2  Creating a browser key (Maps JS only, referrer-locked) ..."
"$GCLOUD" services api-keys create \
  --project "$PROJECT" \
  --display-name="Saarthi Maps (browser)" \
  --allowed-referrers="${APP_URL}/*,http://localhost:3000/*" \
  --api-target=service=maps-backend.googleapis.com \
  --format="value(response.keyString)"

echo
echo "^ Copy that key string and paste it back to Claude."
