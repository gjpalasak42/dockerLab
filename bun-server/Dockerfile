FROM oven/bun:1.1.18-alpine

WORKDIR /usr/app

# Files are copied relative to the build context (project root)
# Copy package files from the bun-server source directory
COPY bun-server/package.json ./
# Copy bun.lockb if it exists (it might not if we just created it, but good practice)
# We won't strictly fail without it, but bun install will generate one.

RUN bun install --production

# Copy server code
COPY bun-server/index.ts ./

# Copy static content from the Grant directory in the root context
COPY grant ./public

# Create a non-root user and group to run the application
RUN addgroup -g 1001 -S bunuser && \
    adduser -u 1001 -S bunuser -G bunuser && \
    chown -R bunuser:bunuser /usr/app

# Switch to non-root user
USER bunuser

# Expose port 8080 (non-privileged port for non-root user)
EXPOSE 8080

CMD ["bun", "run", "index.ts"]
