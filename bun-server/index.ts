import serveStatic from "serve-static-bun";

const server = Bun.serve({
  port: 8080, // Use non-privileged port for running as non-root user
  fetch(req) {
    const url = new URL(req.url);

    // Security: Block dotfiles and path traversal
    if (url.pathname.split('/').some(part => part === '.' || part === '..' || part.startsWith('.'))) {
      return new Response("Not Found", { status: 404 });
    }

    // Serve static files from public directory
    return serveStatic("public")(req);
  },
});

console.log(`Listening on http://localhost:${server.port}`);
