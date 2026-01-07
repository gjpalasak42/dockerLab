# Development Guide

## Architecture: Zero-JS by Default

This site uses Astro's **Island Architecture** optimized for maximum PageSpeed performance:

### Design Principles

1. **Static-first rendering** - All pages are pre-rendered at build time
2. **Zero client JavaScript by default** - No React runtime, no framework overhead
3. **CSS-only animations** - Badges, glows, and hover effects use pure CSS
4. **Opt-in interactivity** - Use `<script is:inline>` only when truly necessary

### When to Add JavaScript

| Scenario | Approach |
|----------|----------|
| Static content | `.astro` component (no JS shipped) |
| CSS animation | Add to `BaseLayout.astro` styles |
| Simple DOM effect | `<script is:inline>` (no bundling) |
| Complex state/React | `client:load` island (last resort) |

### Current JS Usage

The only JavaScript on this site is the typing animation on the home page:

```astro
<!-- src/pages/index.astro -->
<script is:inline>
  // Typing effect - runs inline, no bundler overhead
</script>
```

## Development Commands

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
Grant/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   # Shared layout with nav, footer, styles
│   └── pages/
│       ├── index.astro        # Home page (has typing animation)
│       ├── about.astro        # Static
│       ├── projects.astro     # Static
│       └── contact.astro      # Static
├── public/
│   └── favicon.png
├── astro.config.mjs           # Static output, Tailwind integration
├── tailwind.config.mjs        # Custom theme, animations
└── package.json
```

## Docker Build

The Dockerfile builds the Astro site inside the container:

```bash
docker build -t grantsite-prod -f bun-server/Dockerfile .
docker run -p 8080:8080 grantsite-prod
```

## Performance Targets

- **PageSpeed Performance**: 95-100
- **Client JS Bundle**: ~0 bytes (only inline typing script)
- **Time to Interactive**: < 1s
- **Largest Contentful Paint**: < 1s
