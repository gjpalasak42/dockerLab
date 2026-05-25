import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = (path) => readFile(new URL(`../src/pages/${path}`, import.meta.url), 'utf8');

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
