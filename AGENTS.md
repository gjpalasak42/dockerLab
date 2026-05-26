# Agent Operating Guide

This repository manages Grant's Docker home lab. The primary public asset is the
resume/personal site served by `grantSite`; treat its availability and public
presentation as reputation-sensitive.

## Mission

- Keep the lab healthy, current, and recoverable.
- Prioritize the public resume/personal site when triaging incidents or updates.
- Prefer small, reversible changes with clear verification.
- Use the Computer Use skill when browser or desktop UI access is needed for
  local dashboards, Cloudflare, Portainer, Uptime Kuma, or other authenticated
  tools that are not practical through shell commands alone.

## Stack Overview

Production services are defined in `docker-compose.yaml`:

- `grantSite`: Bun static server for the personal site, built from
  `bun-server/Dockerfile` and static content in `Grant/`.
- `cloudflared`: Cloudflare Tunnel connector for external access.
- `uptime-kuma`: monitoring dashboard.
- `portainer`: Docker management UI.
- `privatebin`: encrypted pastebin.
- `n8n`: workflow automation, with data in `./n8n_data`.

Development site mode is defined in `docker-compose.dev.yaml`.

## Default Safety Rules

- Do not commit secrets. Never print `.env`, tunnel tokens, credentials, cookies,
  or private keys in logs or final reports.
- Do not expose new public ports or change Cloudflare/public routing without
  explicit permission.
- Do not publish public content changes to the personal site that could affect
  reputation without explicit permission.
- Do not delete Docker volumes, prune Docker resources, remove containers, or
  run destructive cleanup commands unless the user explicitly approves the exact
  action.
- Get explicit permission before actions that can cause extended downtime,
  including full stack restarts, Cloudflare tunnel replacement, image major
  upgrades, database or volume migrations, and Portainer or n8n data changes.
- Brief restarts of a single non-critical service are acceptable only when they
  are necessary, low risk, and clearly reported.
- For health checks or investigations, prefer read-only commands first.

## Routine Checks

Use read-only checks before changing anything:

```bash
docker ps
docker inspect <container>
docker compose config --quiet
docker compose ps
docker compose logs --tail=100 <service>
curl -I http://127.0.0.1:${GRANT_SITE_PORT:-8081}/
```

If Docker socket permissions block an important read-only check, ask for the
needed escalation instead of guessing.

## Update Workflow

1. Check `git status --short --branch` and protect any user changes.
2. Fast-forward from origin when clean: `git pull --ff-only`.
3. Review release notes before changing pinned third-party image versions.
4. Validate Compose before deployment: `docker compose config --quiet`.
5. For `grantSite` code/content changes, run both site and server tests when
   available: `cd Grant && bun run test` and `cd bun-server && bun test`.
6. Rebuild or restart only the services needed for the change.
7. Verify health locally and, when appropriate, through the public Cloudflare
   route.

## Public Site Rules

- The source for the personal site is under `Grant/`.
- Production images bake the site during Docker build; content changes require a
  `grantSite` rebuild before production reflects them.
- Keep copy, links, contact details, and project descriptions accurate and
  professional.
- Ask before making opinionated visual, wording, SEO, resume, or public profile
  changes unless the user requested them directly.

## Incident Response

- Start by identifying whether the issue is local container health, the
  Cloudflare tunnel, DNS/routing, or application content.
- Avoid broad restarts as a first move. Inspect health checks and logs for the
  smallest useful fix.
- Record what was checked, what changed, and any remaining risk.
- If downtime is likely to exceed a brief single-service restart, stop and ask
  for permission with the expected impact and rollback path.
