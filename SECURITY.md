# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do NOT open a public issue** for security vulnerabilities
2. **Email the maintainer directly** at the email associated with this GitHub account
3. **Include the following information:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Resolution target**: Within 30 days for critical issues

## Scope

This security policy applies to:

- Docker Compose configurations in this repository
- The custom Bun static file server (`bun-server/`)
- Any scripts or automation in this repository

Third-party images (Portainer, Uptime Kuma, PrivateBin, n8n, cloudflared) should have vulnerabilities reported to their respective maintainers.

## Security Best Practices for Operators

When deploying this stack:

1. **Never commit `.env` files** containing secrets
2. **Use Cloudflare Tunnel** or a reverse proxy for external access (don't expose ports directly)
3. **Keep images updated** - check for security updates regularly
4. **Review Cloudflare Zero Trust policies** - implement access controls
5. **Rotate credentials** periodically (n8n auth, tunnel tokens)
6. **Monitor logs** for suspicious activity via Uptime Kuma and container logs

## Security Features

- All ports bound to `127.0.0.1` by default (localhost only)
- Docker socket mounted read-only where possible
- Static file server runs as non-root user
- Base images pinned to specific versions (no `latest` tags)
- Health checks configured for all services
