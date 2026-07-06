# Monorepo build for Cloud Run (App Hosting can't build a plain pnpm workspace).
# Build a specific app from the REPO ROOT:
#   docker build --build-arg APP=app     -t saarthi-app .
#   docker build --build-arg APP=citizen -t saarthi-citizen .
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

# --- build the chosen app ---
# Install deps and build in ONE stage: pnpm keeps each package's binaries in its
# OWN node_modules/.bin (e.g. app/node_modules/.bin/next), so the install and the
# `next build` must share a filesystem. Manifests are copied first so the install
# layer caches until a package.json or the lockfile changes.
FROM base AS build
ARG APP=app
# citizen bakes the MP-dashboard API origin at build time (NEXT_PUBLIC_* is
# inlined by `next build`). Harmless/empty for the app image.
ARG NEXT_PUBLIC_SAARTHI_API_URL=""
ENV NEXT_PUBLIC_SAARTHI_API_URL=${NEXT_PUBLIC_SAARTHI_API_URL}
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY app/package.json app/
COPY citizen/package.json citizen/
COPY worker/package.json worker/
COPY functions/package.json functions/
COPY scripts/package.json scripts/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter "@saarthi/${APP}" build

# --- runtime: Next.js standalone server (monorepo-rooted layout) ---
FROM node:22-slim AS runner
ARG APP=app
ENV NODE_ENV=production PORT=8080 APP=${APP}
WORKDIR /srv
COPY --from=build /repo/${APP}/.next/standalone ./
COPY --from=build /repo/${APP}/.next/static ./${APP}/.next/static
# (No public/ COPY: both apps ship an empty public dir. Re-add
#  `COPY --from=build /repo/${APP}/public ./${APP}/public` if assets are added.)
EXPOSE 8080
CMD ["sh", "-c", "node ${APP}/server.js"]
