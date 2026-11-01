# syntax=docker/dockerfile:1

# The editor is a set of static files. The build stage always runs on the build
# machine's own architecture, so building images for several architectures does
# not run Node under emulation; only the final nginx layer is per architecture.
FROM --platform=$BUILDPLATFORM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY scripts ./scripts
COPY assets ./assets
COPY src ./src
RUN npm run compile && npm run copy

# Development-only live reload must not ship. Fail the build if anything is left.
RUN sed -i '/debug\/live-reload\.js/d' dist/index.html \
    && rm -rf dist/debug \
    && ! grep -rq "live-reload" dist

# The slim variant leaves out the optional modules (image filter, XSLT, GeoIP,
# njs) and the libraries they pull in. This site only needs core nginx and gzip,
# and every extra package is extra attack surface.
FROM nginxinc/nginx-unprivileged:stable-alpine-slim
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Runs as a non-root user and listens on 8080.
EXPOSE 8080
