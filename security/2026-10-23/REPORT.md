# DockerLab security maintenance — October 23–24, 2026

## Status

All six services in this repository's production Compose stack are healthy on their approved security updates. Stateful services were stopped and backed up individually before migration; the Cloudflare connector was replaced without changing tunnel identity or routing. Public site content is unchanged. Other Compose projects on the Docker host were inventoried but were not changed or comprehensively assessed.

## Image scans

Trivy v0.76.1, freshly downloaded vulnerability database. Counts below are unique (advisory ID, package name, installed version) tuples per image, expressed as **critical / high**. They indicate vulnerable package matches, not proven exploitability. Application advisories can be absent from scanner output; Portainer's vendor advisories separately confirm critical authorization vulnerabilities in 2.39.8.

| Service | Original | Deployed | Original C / H | Replacement C / H |
|---|---|---|---:|---:|
| grantSite | Bun 1.4.3 + build tools | Bun 1.4.4, runtime only | 2 / 30 | 0 / 0 |
| n8n | 1.123.31 | 2.44.6 | 51 / 269 | 4 / 18 |
| Uptime Kuma | 2.3.2 | 2.5.7 | 252 / 2584 | 25 / 383 |
| Portainer | 2.39.8-alpine | 2.45.3-alpine | 0 / 16 | 0 / 7 |
| PrivateBin | 1.7.8 | 2.1.0 | 83 / 251 | 0 / 4 |
| Cloudflared | 2026.10.0 | 2026.10.3 | 0 / 8 | 0 / 1 |

Latest vendor images still contain findings. Updating image tags alone cannot establish that everything is patched. Remaining fixes may require upstream image rebuilds, supported dependency changes or service-specific mitigations. The deployed stack is not vulnerability-free.

## Completed

- Snapshotted the running site's static assets and server before replacing its image.
- Built grantsite-security:2026-10-23 using Bun 1.4.4 and only the server production dependency plus the existing static files. Excluded Astro, build tools and their caches from runtime.
- Retained the original running image as grantsite-rollback:2026-10-23; deployed the candidate under the Compose image name grantsite-prod with no other service recreation.
- Verified the new container healthy and localhost HTTP 200; compared SHA-256 hashes of all ten static files, with no changes.
- Public https://grant.palasak.com/ returned HTTP 200. Cloudflare rewrites Google Fonts and injects scripts; page body matches after removing those injected scripts.
- Updated the source Dockerfile to use isolated build/dependency/runtime stages and frozen lockfiles. Source dependency refresh remains on Astro 7.x / Tailwind 4.x, the major versions already present in the user's uncommitted work; added an Undici security override >=8.12.2.
- Preserved the related pre-existing source changes for the security branch; no public content publication. The separately tested source-build image was not deployed.
- Site tests: 11 passed. Server tests: 5 passed (required localhost socket permission). Both source package audits returned no advisories after the dependency refresh. Repository Docker build passed with Bun 1.4.4. Host-only Astro build failed because host Node 20 is below Astro's requirement; the container build passed.
- Compose validation passed, and all six scoped services remain healthy.

## Approved upgrades completed October 24

- n8n: 1.123.31 -> 2.44.6. There were zero saved or active workflows before migration and zero afterwards. Startup completed 85 migrations, health returned OK, and SQLite quick_check passed. The default image has no Python 3 task runner; no workflows currently depend on it. Future Python Code workflows require a supported external runner setup.
- Uptime Kuma: 2.3.2 -> 2.5.7. Complete data-volume backup verified, application version checked, healthy after schema migration.
- Portainer: 2.39.8-alpine -> 2.45.3-alpine. Complete data-volume backup verified; API reports 2.45.3 and health passes. The new release distrusts compromised eMudhra certificates; integrations using those certificates may require replacement certificates.
- PrivateBin: 1.7.8 -> 2.1.0. Default configuration was in use with no legacy custom settings requiring conversion. Backed up all four anonymous volumes and application configuration; every original volume identity was retained. Local and public HTTP checks pass.
- Cloudflared: 2026.10.0 -> 2026.10.3. Healthy on the existing tunnel identity and routing.
- Verified all five deployed image IDs match the downloaded, scanned candidates. All six Compose services report healthy.
- Public routes: grant and paste returned 200; n8n, status and Portainer returned 302 through their access/login redirects. Authenticated UI functionality was not exercised.
- Production and development Compose validation pass. Site tests: 11 passed; server tests: 5 passed. Site package audit reports no advisories. The source Docker build passed during preparation. CI now uses Node 24 and Bun 1.4.4 for the updated dependency requirements.

## Recovery and sensitive data

Private consistent backups are retained locally under the ignored `.maintenance-backups/2026-10-24/`. They include the complete stateful-service data, configuration, pre-upgrade container metadata and required environment configuration; backup files have restrictive permissions. Each tar archive was checked for readable contents before upgrade. A full restore rehearsal has not been performed.

Exact old images are retained as `dockerlab-rollback-<service>:2026-10-24`, alongside the site's `grantsite-rollback:2026-10-23`. Restore the matching pre-upgrade data backup together with the old image when rolling back a migrated service; do not run an old image against migrated data. Private rollback Compose configuration is stored with the backups. No volumes were deleted or pruned.

Backups are excluded from both Git and Docker build contexts. Raw scans, private startup logs, environment files and container metadata are excluded from the commit. Gitleaks v8.30.1 scanned the exact staged repository snapshot with zero findings; a separate check found no matches for the three known local credential values, and no runtime data or environment secrets are tracked. The reviewed changes are pushed on `grant-security-stack-2026-10-24`; pushing to main would automatically publish the existing site-source changes through Cloudflare Pages. The related Astro/Tailwind migration changes already present at the start were retained as part of the reviewable source update, without publishing them.

## Evidence

Raw Trivy JSON, logs, official vendor advisory JSON, deployment snapshot and the initial working-tree patch are currently in `/private/tmp/dockerlab-security/`. That temporary directory may be cleared by the system; the original site image is also retained in Docker under the rollback tag. Service backups are now complete; full restore rehearsals remain unperformed.

## Vendor references

- https://bun.com/blog/bun-v1.4.4
- https://github.com/portainer/portainer/releases/tag/2.45.3
- https://github.com/portainer/portainer/security/advisories/GHSA-j3mf-q9qf-5qf8
- https://github.com/n8n-io/n8n/releases
- https://docs.n8n.io/2-0-breaking-changes/
- https://github.com/louislam/uptime-kuma/releases/tag/2.5.7
- https://github.com/PrivateBin/PrivateBin/releases/tag/2.1.0
- https://github.com/cloudflare/cloudflared/releases/tag/2026.10.3
