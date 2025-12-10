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
COPY Grant ./public

# Expose port 80
EXPOSE 80

CMD ["bun", "run", "index.ts"]
