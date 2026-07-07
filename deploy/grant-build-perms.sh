#!/usr/bin/env bash
# One-time: let Cloud Build (running as the Compute Engine default service
# account on new projects) read the source bucket and push images.
# Run from the repo root:  bash deploy/grant-build-perms.sh
set -euo pipefail

GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"
PROJECT="saarthi-501522"
CB_SA="353201937460-compute@developer.gserviceaccount.com"

"$GCLOUD" projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None

echo "Granted roles/cloudbuild.builds.builder to ${CB_SA}"
