# Bun Static Site (Grant's Site)

A high-performance static file server using [Bun](https://bun.sh), Dockerized for easy deployment.

## Project Structure
- `bun-server/`: Source code for the Bun server.
  - `index.ts`: Main server logic (Static serving + Security headers).
  - `Dockerfile`: Multi-stage build definition.
- `Grant/`: Static website content (HTML/CSS/JS).
- `docker-compose.yaml`: Orchestration config.

## Build and Deploy

This service is defined as `grantSite` in the `docker-compose.yaml` file.

To build and deploy changes:

```bash
# Rebuild the image and restart the container
docker compose up -d --build grantSite
```

The server listens on port **80** inside the container (mapped to `GRANT_SITE_PORT` on host).

## Security
- **Dotfile Protection**: The server explicitly returns `404 Not Found` for any path containing dotfiles (e.g., `.env`, `.git`).
- **Container**: Runs on a minimal Alpine Linux image.

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
