# syntax=docker/dockerfile:1.4
FROM golang:1.23-bookworm AS docs-generate
WORKDIR /app
ENV GOTOOLCHAIN=auto
RUN apt-get update && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download
COPY backend/ ./backend/
COPY docs/ ./docs/
ENV GOFORJ_EXAMPLES_MANIFEST=/app/examples.json
RUN --mount=type=cache,target=/tmp/goforj-docs \
  cd backend && go run . docs:generate

FROM node:20-bookworm-slim AS docs-build
ARG GA_MEASUREMENT_ID
ENV GA_MEASUREMENT_ID=${GA_MEASUREMENT_ID}
WORKDIR /app/docs
COPY docs/package.json docs/package-lock.json ./
RUN npm ci --include=dev
COPY --from=docs-generate /app/docs/ ./
RUN NODE_ENV=production npm run build

FROM golang:1.23-bookworm AS backend-build
WORKDIR /app
ENV GOTOOLCHAIN=auto
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download
COPY backend/ ./backend/
COPY --from=docs-build /app/docs/.vitepress/dist ./backend/frontend/dist
RUN cd backend && CGO_ENABLED=0 go build -o /app/bin/docs .

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV GOFORJ_EXAMPLES_MANIFEST=/app/examples.json
WORKDIR /app
COPY --from=backend-build /app/bin/docs /app/docs
COPY --from=docs-generate /app/examples.json /app/examples.json
EXPOSE 3000
ENTRYPOINT ["/app/docs", "http:serve", "--port", "3000"]
