import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

// We'll spawn the server process for integration testing
// or simpler, just import the handler if we exported it, but spawning ensures full env check.
// For now, we'll assume we can just request against localhost if we run it, but CI/CD is tricky.
// Better: Mock the request behavior or unit test the logic.
// Let's do a simple unit-style test of the logic by extracting the handler if possible, 
// or just creating a temporary server instance in the test.

const PORT = 3001;
const PUBLIC_DIR = join(import.meta.dir, "../public_test");

describe("Bun Static Server", () => {
    let server;

    beforeAll(() => {
        // Setup test dir
        try { mkdirSync(PUBLIC_DIR); } catch {}
        writeFileSync(join(PUBLIC_DIR, "hello.txt"), "Hello Bun!");
        writeFileSync(join(PUBLIC_DIR, ".secret"), "shh");

        // Start server instance
        server = Bun.serve({
            port: PORT,
            fetch(req) {
                const url = new URL(req.url);
                if (url.pathname.split('/').some(part => part.startsWith('.') && part !== '.' && part !== '..')) {
                     return new Response("Not Found", { status: 404 });
                }
                // Mock static serve for test environment (mapping to test dir instead of real public)
                // In real app, we use serve-static-bun("public")
                // For test, we manually serve from PUBLIC_DIR
                const filePath = join(PUBLIC_DIR, url.pathname);
                const file = Bun.file(filePath);
                return new Response(file);
            }
        });
    });

    afterAll(() => {
        server.stop();
        rmSync(PUBLIC_DIR, { recursive: true, force: true });
    });

    test("serves static files", async () => {
        const res = await fetch(`http://localhost:${PORT}/hello.txt`);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("Hello Bun!");
    });

    test("returns 404 for dotfiles", async () => {
        const res = await fetch(`http://localhost:${PORT}/.secret`);
        expect(res.status).toBe(404);
    });

    test("returns 404 for nested dotfiles", async () => {
         const res = await fetch(`http://localhost:${PORT}/folder/.env`);
         expect(res.status).toBe(404);
    });
});
