# dockerLab

A self-hosted Docker Compose stack for personal infrastructure, including a static site, monitoring, automation, and secure file sharing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Host Machine                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  grantSite  │  │  Portainer  │  │ Uptime Kuma │  │ PrivateBin │  │
│  │   :8081     │  │   :9000     │  │   :3001     │  │   :8084    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │
│  ┌─────────────┐  ┌─────────────────────────────────────────────┐   │
│  │     n8n     │  │              cloudflared                    │   │
│  │   :5678     │  │  (Cloudflare Tunnel - no exposed port)      │   │
│  └─────────────┘  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Cloudflare Zero Trust
                    (HTTPS termination)
```

## Services

| Service       | Description                          | Internal Port | Default Host Port | Image                              |
|---------------|--------------------------------------|---------------|-------------------|------------------------------------|
| grantSite     | Static site server (Bun)             | 8080          | 8081              | Custom (bun-server/Dockerfile)     |
| portainer     | Docker management UI                 | 9000          | 9000              | portainer/portainer-ce:2.21.5-alpine |
| uptime-kuma   | Uptime monitoring dashboard          | 3001          | 3001              | louislam/uptime-kuma:1.23.16       |
| privatebin    | Encrypted pastebin                   | 8080          | 8084              | privatebin/nginx-fpm-alpine:1.7.6  |
| cloudflared   | Cloudflare Tunnel connector          | -             | -                 | cloudflare/cloudflared:2024.12.2   |
| n8n           | Workflow automation                  | 5678          | 5678              | n8nio/n8n:1.72.1                   |

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/gjpalasak42/dockerLab.git
cd dockerLab

# Copy the example environment file and edit with your values
cp .env.example .env
nano .env  # or use your preferred editor
```

### 2. Configure Cloudflare Tunnel (Required for External Access)

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Tunnels**
3. Create a tunnel and copy the token
4. Paste the token into your `.env` file as `CLOUDFLARED_TUNNEL_TOKEN`

### 3. Start Services

```bash
# Production (all services)
docker compose up -d

# Development (static site only)
docker compose -f docker-compose.dev.yaml up -d
```

### 4. Verify Services

```bash
# Check container health
docker compose ps

# View logs
docker compose logs -f
```

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

| Variable                   | Required | Description                              |
|----------------------------|----------|------------------------------------------|
| `TZ`                       | No       | Timezone (e.g., `America/New_York`)      |
| `GRANT_SITE_PORT`          | Yes      | Host port for static site                |
| `PORTAINER_PORT`           | Yes      | Host port for Portainer UI               |
| `UPTIME_KUMA_PORT`         | Yes      | Host port for Uptime Kuma                |
| `PRIVATEBIN_PORT`          | Yes      | Host port for PrivateBin                 |
| `CLOUDFLARED_TUNNEL_TOKEN` | Yes*     | Cloudflare tunnel token                  |
| `N8N_PORT`                 | Yes      | Host port for n8n                        |
| `N8N_BASIC_AUTH_*`         | Yes      | n8n authentication settings              |
| `N8N_HOST`                 | Yes      | n8n host domain                          |
| `N8N_WEBHOOK_TUNNEL_URL`   | No       | External webhook URL for n8n             |

*Required only if using Cloudflare Tunnel for external access.

## HTTPS and Security

### Cloudflare Tunnel (Recommended)

This stack uses [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) for secure external access:

- **HTTPS termination** is handled by Cloudflare
- **No exposed ports** to the public internet
- **Zero Trust access policies** can be applied per-service
- **DDoS protection** included

All service ports are bound to `127.0.0.1` (localhost only) by default. Traffic flows:

```
Internet → Cloudflare (HTTPS) → cloudflared → services (localhost)
```

### Port Security

- All ports bind to `127.0.0.1` by default (not exposed externally)
- Docker socket is mounted read-only where possible
- Services run as non-root users where supported

### Updating Images

Images are pinned to specific versions for stability. To update:

```bash
# Pull latest versions (check release notes first!)
docker compose pull

# Recreate containers with new images
docker compose up -d
```

## Development

### Static Site Development

See [bun-server/README.md](bun-server/README.md) for detailed instructions on developing the static site.

```bash
# Start development server
docker compose -f docker-compose.dev.yaml up -d --build grantSite

# Watch logs
docker compose -f docker-compose.dev.yaml logs -f grantSite

# Rebuild after changes to the Bun server
docker compose -f docker-compose.dev.yaml up -d --build grantSite
```

### Running Tests

```bash
cd bun-server
bun test
```

## Project Structure

```
dockerLab/
├── bun-server/           # Bun static file server
│   ├── Dockerfile        # Multi-stage build
│   ├── index.ts          # Server code
│   ├── package.json      # Dependencies
│   └── tests/            # Test files
├── Grant/                # Static website content
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── projects.html
├── statusPage/           # Status page content
├── docker-compose.yaml   # Production config
├── docker-compose.dev.yaml # Development config
├── .env.example          # Environment template
├── .gitignore
├── README.md             # This file
└── SECURITY.md           # Security policy
```

## Troubleshooting

### Container Health Checks

All services have health checks configured. Check status with:

```bash
docker compose ps
```

Healthy containers show `(healthy)` in the STATUS column.

### Common Issues

1. **Port conflicts**: Change the `*_PORT` variables in `.env`
2. **Cloudflare tunnel not connecting**: Verify your token is correct
3. **Permission errors**: Ensure data directories are writable

### Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f grantSite
```

## License

This project is for personal/educational use.

## Security

See [SECURITY.md](SECURITY.md) for security policy and how to report vulnerabilities.
