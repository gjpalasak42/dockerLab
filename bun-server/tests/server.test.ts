import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { createStaticFetchHandler } from "../index";

const PORT = 3001;
const PUBLIC_DIR_NAME = "public_test";
const PUBLIC_DIR = join(import.meta.dir, "..", PUBLIC_DIR_NAME);

describe("Bun Static Server", () => {
  let server: ReturnType<typeof Bun.serve>;

  beforeAll(() => {
    mkdirSync(PUBLIC_DIR, { recursive: true });
    mkdirSync(join(PUBLIC_DIR, "folder"), { recursive: true });
    writeFileSync(join(PUBLIC_DIR, "hello.txt"), "Hello Bun!");
    writeFileSync(join(PUBLIC_DIR, ".secret"), "shh");
    writeFileSync(join(PUBLIC_DIR, "folder", ".env"), "nested secret");

    server = Bun.serve({
      port: PORT,
      fetch: createStaticFetchHandler(PUBLIC_DIR_NAME),
    });
  });

  afterAll(() => {
    server.stop();
    rmSync(PUBLIC_DIR, { recursive: true, force: true });
  });

  test("serves static files through the production handler", async () => {
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

  test("returns 404 for path traversal attempts", async () => {
    const res = await fetch(`http://localhost:${PORT}/../package.json`);

    expect(res.status).toBe(404);
  });
});
