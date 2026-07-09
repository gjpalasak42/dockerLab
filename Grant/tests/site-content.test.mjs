import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = (path) => readFile(new URL(`../src/pages/${path}`, import.meta.url), 'utf8');
const repoFile = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('home page presents Rock Atlas as a live public project', async () => {
  const home = await source('index.astro');

  assert.match(home, /Rock Atlas/);
  assert.match(home, /https:\/\/rocks\.palasak\.com/);
  assert.match(home, /interactive geology/i);
});

test('projects page includes Rock Atlas in the portfolio design', async () => {
  const projects = await source('projects.astro');

  assert.match(projects, /Rock Atlas/);
  assert.match(projects, /https:\/\/rocks\.palasak\.com/);
  assert.match(projects, /searchable specimen data/i);
});

test('projects page marks only Rock Atlas as new', async () => {
  const projects = await source('projects.astro');
  const newBadges = projects.match(/<span class="new-badge">New<\/span>/g) ?? [];
  const rockAtlasStart = projects.indexOf('Rock Atlas');
  const rockAtlasBadge = projects.indexOf('<span class="new-badge">New</span>', rockAtlasStart);
  const nextSection = projects.indexOf('<!-- Certifications -->', rockAtlasStart);

  assert.equal(newBadges.length, 1);
  assert.ok(rockAtlasStart > -1);
  assert.ok(rockAtlasBadge > rockAtlasStart);
  assert.ok(rockAtlasBadge < nextSection);
});

test('contact page links to the canonical Hack The Box profile', async () => {
  const contact = await source('contact.astro');

  assert.match(contact, /https:\/\/app\.hackthebox\.com\/users\/963092/);
  assert.doesNotMatch(contact, /profile-top-tab|ownership-period|profile-bottom-tab/);
});

test('site navigation uses the explicit homepage file for local previews', async () => {
  const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  const notFound = await source('404.astro');

  assert.match(layout, /href="\/index\.html"/);
  assert.doesNotMatch(layout, /href="\/"/);
  assert.match(notFound, /href="\/index\.html"/);
});

test('deploy workflow runs Grant content tests before building', async () => {
  const workflow = await repoFile('.github/workflows/deploy-grant-pages.yaml');
  const testStep = workflow.indexOf('run: bun run test');
  const buildStep = workflow.indexOf('run: bun run build');

  assert.ok(testStep > -1);
  assert.ok(buildStep > -1);
  assert.ok(testStep < buildStep);
});

test('ci workflow runs Grant content tests before building', async () => {
  const workflow = await repoFile('.github/workflows/ci.yaml');
  const testStep = workflow.indexOf('run: bun run test');
  const buildStep = workflow.indexOf('run: bun run build');

  assert.ok(testStep > -1);
  assert.ok(buildStep > -1);
  assert.ok(testStep < buildStep);
});

test('agent guide includes Grant and Bun server tests for site changes', async () => {
  const guide = await repoFile('AGENTS.md');

  assert.match(guide, /cd Grant && bun run test/);
  assert.match(guide, /cd bun-server && bun test/);
});

test('cloudflared healthcheck uses the tunnel readiness endpoint', async () => {
  const compose = await repoFile('docker-compose.yaml');

  assert.doesNotMatch(compose, /cloudflared", "--version"/);
  assert.match(compose, /--metrics 127\.0\.0\.1:20241 run --token \$\{CLOUDFLARED_TUNNEL_TOKEN\}/);
  assert.match(compose, /"cloudflared", "tunnel", "--metrics", "127\.0\.0\.1:20241", "ready"/);
});
