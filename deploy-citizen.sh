#!/usr/bin/env bash
# Deploy the Saarthi Citizen Portal to Cloud Run.
# It bakes in the MP-dashboard API URL at build time, then deploys the image.
# Run from the repo root:  bash deploy-citizen.sh
set -euo pipefail

GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"
PROJECT="saarthi-501522"
REGION="asia-south1"
SA="firebase-app-hosting-compute@saarthi-501522.iam.gserviceaccount.com"
API_URL="https://saarthi-app-353201937460.asia-south1.run.app"
IMAGE="asia-south1-docker.pkg.dev/${PROJECT}/cloud-run-source-deploy/saarthi-citizen:latest"

echo "Building citizen image (API origin: ${API_URL}) ..."
"$GCLOUD" builds submit --project "$PROJECT" --region "$REGION" \
  --config cloudbuild-citizen.yaml \
  --substitutions "_API_URL=${API_URL},_IMAGE=${IMAGE}"

echo "Deploying citizen to Cloud Run ..."
"$GCLOUD" run deploy saarthi-citizen --project "$PROJECT" --region "$REGION" \
  --image "$IMAGE" \
  --allow-unauthenticated \
  --service-account "$SA" \
  --memory 1Gi --cpu 1 --port 8080
