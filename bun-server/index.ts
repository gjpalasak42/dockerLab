import serveStatic from "serve-static-bun";

export function createStaticFetchHandler(publicDir = "public") {
  const servePublic = serveStatic(publicDir);

  return (req: Request) => {
    const url = new URL(req.url);

    // Security: Block dotfiles and path traversal
    if (url.pathname.split('/').some(part => part === '.' || part === '..' || part.startsWith('.'))) {
      return new Response("Not Found", { status: 404 });
    }

    // Resolve the homepage explicitly instead of relying on directory-index
    // behavior. This also gives local navigation a stable /index.html target.
    if (url.pathname === "/") {
      const indexUrl = new URL("/index.html", url);
      return servePublic(new Request(indexUrl, req));
    }

    // Serve static files from public directory
    return servePublic(req);
  };
}

if (import.meta.main) {
  const server = Bun.serve({
    port: 8080, // Use non-privileged port for running as non-root user
    fetch: createStaticFetchHandler(),
  });

  console.log(`Listening on http://localhost:${server.port}`);
}
