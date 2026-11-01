# syntax=docker/dockerfile:1

# Runs on the build machine's architecture so multi-architecture builds do not emulate Node.
FROM --platform=$BUILDPLATFORM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY scripts ./scripts
COPY assets ./assets
COPY src ./src
RUN npm run compile && npm run copy

RUN sed -i '/debug\/live-reload\.js/d' dist/index.html \
    && rm -rf dist/debug \
    && ! grep -rq "live-reload" dist

FROM nginxinc/nginx-unprivileged:stable-alpine-slim
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
