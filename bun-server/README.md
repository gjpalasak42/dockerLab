# Bun Static Site (Grant's Site)

A high-performance static file server using [Bun](https://bun.sh), Dockerized for easy deployment.

## Project Structure

```
bun-server/
├── index.ts        # Main server logic (static serving + security)
├── Dockerfile      # Container build definition
├── package.json    # Dependencies
├── bun.lock        # Lockfile
└── tests/          # Test files
    └── server.test.ts

../Grant/           # Static website content (HTML/CSS/JS)
```

## Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# From the repository root directory
# Build and run the container
docker compose up -d --build grantSite

# View logs
docker compose logs -f grantSite

# Stop the container
docker compose down
```

The server listens on port **8080** inside the container, mapped to `GRANT_SITE_PORT` on the host (default: 8081).

### Option 2: Local Development (Without Docker)

**Prerequisites**: [Bun](https://bun.sh) installed locally.

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Navigate to the bun-server directory
cd bun-server

# Install dependencies
bun install

# Run the server locally
bun run start
```

The server will be available at `http://localhost:8080`.

### Option 3: Docker Development Mode

For development with live file updates:

```bash
# From the repository root
docker compose -f docker-compose.dev.yaml up -d --build grantSite

# Watch logs
docker compose -f docker-compose.dev.yaml logs -f grantSite
```

Static files in `Grant/` are mounted read-only, so changes to HTML/CSS/JS are reflected immediately (refresh your browser).

## Running Tests

```bash
cd bun-server
bun test
```

Tests verify:
- Static file serving
- Dotfile protection (security)
- Path traversal protection

## Security

- **Dotfile Protection**: Returns `404 Not Found` for paths containing dotfiles (`.env`, `.git`, etc.)
- **Path Traversal Protection**: Blocks `..` in URL paths
- **Non-Root User**: Container runs as `bunuser` (UID 1001), not root
- **Minimal Image**: Built on `oven/bun:1.1.18-alpine` (Alpine Linux)
- **Read-Only Mounts**: Static content mounted as read-only in production

## Customizing Content

1. Edit files in the `Grant/` directory (at the repository root)
2. Rebuild if using production Docker:
   ```bash
   docker compose up -d --build grantSite
   ```
3. Or simply refresh the browser if using development mode

## Health Check

The container includes a health check that verifies the server is responding:

```bash
# Check container health status
docker compose ps
```

Healthy containers show `(healthy)` in the STATUS column.

---

## Future Development & Upgrade Path

To evolve this project from a static server to a dynamic full-stack application, follow this roadmap:

### Phase 1: Tooling Upgrade (Framework & Data)
1.  **Framework**: Switch to [ElysiaJS](https://elysiajs.com) for a robust, Type-Safe framework.
    ```bash
    cd bun-server
    bun add elysia
    ```
2.  **ORM**: Add [Prisma](https://www.prisma.io) for database interaction.
    ```bash
    bun add -d prisma
    bun add @prisma/client
    bunx prisma init
    ```

### Phase 2: Feature Implementation (Dynamic Routes)
Example `index.ts` with Elysia:

```typescript
import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
    // Serve static files from public
    .use(staticPlugin({ assets: "public", prefix: "/" }))
    
    // Dynamic API Route
    .post("/api/contact", async ({ body }) => {
        // Handle form submission
        console.log("Contact form:", body);
        return { success: true };
    })
    
    .listen(8080);

console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`);
```

### Phase 3: Security Review for Dynamic App
When moving to dynamic content, implement these additional layers:
1.  **Input Validation**: Use Elysia's schema validation (based on TypeBox) to sanitize all inputs.
2.  **CORS**: Configure Cross-Origin Resource Sharing if your API is accessed from other domains.
3.  **Rate Limiting**: Protect against abuse using `elysia-rate-limit`.
4.  **Secure HTTP Headers**: Use Elysia-specific middleware or plugins to set security-related HTTP headers (e.g., [@elysiajs/secure-headers](https://github.com/elysiajs/secure-headers)), as Helmet is not compatible with Elysia.
