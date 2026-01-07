FROM oven/bun:1.1.18-alpine

WORKDIR /usr/app

# --- Stage 1: Build the Astro site ---
# Copy the Astro project source (Grant directory in the context root)
COPY Grant ./website

WORKDIR /usr/app/website

# Install dependencies and build static site
RUN bun install
RUN bun run build

# --- Stage 2: Setup the static server ---
WORKDIR /usr/app

# Copy server package files
COPY bun-server/package.json ./
RUN bun install --production

# Copy server code
COPY bun-server/index.ts ./

# Copy built static files from Astro dist to public
RUN mkdir -p ./public && cp -r website/dist/* ./public/

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

