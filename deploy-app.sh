#!/usr/bin/env bash
# Deploy the Saarthi MP dashboard + API to Cloud Run (from the Dockerfile).
# Run from the repo root:  bash deploy-app.sh
set -euo pipefail

GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"
PROJECT="saarthi-501522"
REGION="asia-south1"
SA="firebase-app-hosting-compute@saarthi-501522.iam.gserviceaccount.com"

"$GCLOUD" run deploy saarthi-app \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --service-account "$SA" \
  --set-env-vars "GOOGLE_VERTEX_PROJECT=${PROJECT},GOOGLE_VERTEX_LOCATION=us-central1,FIREBASE_PROJECT_ID=${PROJECT}" \
  --memory 1Gi --cpu 1 --port 8080
