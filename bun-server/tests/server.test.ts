import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { createServer } from "net";
import { join } from "path";
import { createStaticFetchHandler } from "../index";

const PUBLIC_DIR_NAME = "public_test";
const PUBLIC_DIR = join(import.meta.dir, "..", PUBLIC_DIR_NAME);

async function getAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const probe = createServer();

    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();

      probe.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
          return;
        }

        reject(new Error("Unable to reserve an available test port"));
      });
    });
  });
}

describe("Bun Static Server", () => {
  let server: ReturnType<typeof Bun.serve>;

  beforeAll(async () => {
    mkdirSync(PUBLIC_DIR, { recursive: true });
    mkdirSync(join(PUBLIC_DIR, "folder"), { recursive: true });
    writeFileSync(join(PUBLIC_DIR, "index.html"), "<h1>Home</h1>");
    writeFileSync(join(PUBLIC_DIR, "hello.txt"), "Hello Bun!");
    writeFileSync(join(PUBLIC_DIR, ".secret"), "shh");
    writeFileSync(join(PUBLIC_DIR, "folder", ".env"), "nested secret");

    server = Bun.serve({
      hostname: "127.0.0.1",
      port: await getAvailablePort(),
      fetch: createStaticFetchHandler(PUBLIC_DIR_NAME),
    });
  });

  afterAll(() => {
    server?.stop();
    rmSync(PUBLIC_DIR, { recursive: true, force: true });
  });

  test("serves static files through the production handler", async () => {
    const res = await fetch(`http://127.0.0.1:${server.port}/hello.txt`);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello Bun!");
  });

  test("serves index.html directly for the root route", async () => {
    const res = await fetch(`http://127.0.0.1:${server.port}/`, {
      redirect: "manual",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(await res.text()).toBe("<h1>Home</h1>");
  });

  test("returns 404 for dotfiles", async () => {
    const res = await fetch(`http://127.0.0.1:${server.port}/.secret`);

    expect(res.status).toBe(404);
  });

  test("returns 404 for nested dotfiles", async () => {
    const res = await fetch(`http://127.0.0.1:${server.port}/folder/.env`);

    expect(res.status).toBe(404);
  });

  test("returns 404 for path traversal attempts", async () => {
    const res = await fetch(`http://127.0.0.1:${server.port}/../package.json`);

    expect(res.status).toBe(404);
  });
});
