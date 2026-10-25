FROM oven/bun:1.4.4-alpine AS site-build

WORKDIR /usr/app

# --- Stage 1: Build the Astro site ---
# Copy the Astro project source (Grant directory in the context root)
COPY Grant ./website

WORKDIR /usr/app/website

# Install dependencies and build static site
RUN bun install --frozen-lockfile
RUN bun run build

# --- Stage 2: Setup the static server ---
FROM oven/bun:1.4.4-alpine AS server-deps
WORKDIR /usr/app

# Copy server package files
COPY bun-server/package.json bun-server/bun.lock ./
RUN bun install --frozen-lockfile --production

# Keep site build tools and package-manager caches out of production.
FROM oven/bun:1.4.4-alpine AS runtime
WORKDIR /usr/app
COPY --from=server-deps /usr/app/package.json ./
COPY --from=server-deps /usr/app/node_modules ./node_modules

# Copy server code
COPY bun-server/index.ts ./

# Copy built static files from Astro dist to public
COPY --from=site-build /usr/app/website/dist ./public

# Create a non-root user and group to run the application
RUN addgroup -g 1001 -S bunuser && \
    adduser -u 1001 -S bunuser -G bunuser && \
    chown -R bunuser:bunuser /usr/app

# Switch to non-root user
USER bunuser

# Expose port 8080 (non-privileged port for non-root user)
EXPOSE 8080

# Healthcheck using Bun to verify server is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD bun -e "fetch('http://localhost:8080/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "index.ts"]

