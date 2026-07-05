# Monorepo build for Cloud Run (fallback to Firebase App Hosting).
# Build a specific app from the REPO ROOT:
#   docker build --build-arg APP=app     -t saarthi-app .
#   docker build --build-arg APP=citizen -t saarthi-citizen .
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

# --- install workspace deps (needs every member's manifest) ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY app/package.json app/
COPY citizen/package.json citizen/
COPY worker/package.json worker/
COPY functions/package.json functions/
COPY scripts/package.json scripts/
RUN pnpm install --frozen-lockfile

# --- build the chosen app ---
FROM base AS build
ARG APP=app
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter "@saarthi/${APP}" build

# --- runtime: Next.js standalone server (monorepo-rooted layout) ---
FROM node:22-slim AS runner
ARG APP=app
ENV NODE_ENV=production PORT=8080 APP=${APP}
WORKDIR /srv
COPY --from=build /repo/${APP}/.next/standalone ./
COPY --from=build /repo/${APP}/.next/static ./${APP}/.next/static
EXPOSE 8080
CMD ["sh", "-c", "node ${APP}/server.js"]
