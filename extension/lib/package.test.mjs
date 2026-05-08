// Run with: node --test extension/lib/package.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { shouldInclude } from "../tools/package.mjs";

// ============================================================================
// Files that MUST end up in the published zip
// ============================================================================

test("includes manifest.json", () => {
  assert.equal(shouldInclude("manifest.json"), true);
});

test("includes top-level script files", () => {
  assert.equal(shouldInclude("background.js"), true);
  assert.equal(shouldInclude("content.js"), true);
  assert.equal(shouldInclude("popup.js"), true);
  assert.equal(shouldInclude("options.js"), true);
  assert.equal(shouldInclude("config.js"), true);
});

test("includes html files", () => {
  assert.equal(shouldInclude("popup.html"), true);
  assert.equal(shouldInclude("options.html"), true);
});

test("includes content/ adapter scripts", () => {
  assert.equal(shouldInclude("content/replace.js"), true);
  assert.equal(shouldInclude("content/adapters.js"), true);
  assert.equal(shouldInclude("content/autocorrect.js"), true);
});

test("includes lib/data.js and lib/detector.js (runtime data + JS port)", () => {
  assert.equal(shouldInclude("lib/data.js"), true);
  assert.equal(shouldInclude("lib/detector.js"), true);
});

test("includes lib/hangul.js (Korean Hangul compose/decompose helper)", () => {
  assert.equal(shouldInclude("lib/hangul.js"), true);
});

test("includes lib/i18n.js (localization helper)", () => {
  assert.equal(shouldInclude("lib/i18n.js"), true);
});

test("includes _locales messages files for every shipped locale", () => {
  for (const code of ["en", "ru", "uk", "be", "de", "fr", "el", "he", "tr", "pl", "es", "ko"]) {
    assert.equal(shouldInclude(`_locales/${code}/messages.json`), true, `_locales/${code} should ship`);
  }
});

test("includes icons", () => {
  assert.equal(shouldInclude("icons/icon16.png"), true);
  assert.equal(shouldInclude("icons/icon128.png"), true);
});

// ============================================================================
// Files that MUST be excluded from the published zip
// ============================================================================

test("excludes test files and helpers (anything *.mjs)", () => {
  assert.equal(shouldInclude("lib/detector.test.mjs"), false);
  assert.equal(shouldInclude("lib/config.test.mjs"), false);
  assert.equal(shouldInclude("lib/adapters.test.mjs"), false);
  assert.equal(shouldInclude("lib/test-helpers.mjs"), false);
  // Production code uses .js, not .mjs.
});

test("excludes legacy *.test.js variants too", () => {
  assert.equal(shouldInclude("foo.test.js"), false);
});

test("excludes the build script", () => {
  assert.equal(shouldInclude("lib/build-models.mjs"), false);
});

test("excludes README and PRIVACY", () => {
  assert.equal(shouldInclude("README.md"), false);
  assert.equal(shouldInclude("PRIVACY.md"), false);
});

test("excludes package.json and lockfile", () => {
  assert.equal(shouldInclude("package.json"), false);
  assert.equal(shouldInclude("package-lock.json"), false);
});

test("excludes the tools directory", () => {
  assert.equal(shouldInclude("tools/package.mjs"), false);
  assert.equal(shouldInclude("tools/anything.js"), false);
});

test("excludes the build-time data sources (layouts + wordlists)", () => {
  assert.equal(shouldInclude("data/layouts/en.json"), false);
  assert.equal(shouldInclude("data/wordlists/en.txt"), false);
});

test("excludes the dist directory", () => {
  assert.equal(shouldInclude("dist/foo.zip"), false);
  assert.equal(shouldInclude("dist/nested/file.js"), false);
});

test("excludes node_modules at any depth", () => {
  assert.equal(shouldInclude("node_modules/x/index.js"), false);
  assert.equal(shouldInclude("lib/node_modules/wat.js"), false);
});

test("excludes OS metadata", () => {
  assert.equal(shouldInclude(".DS_Store"), false);
});

test("excludes dotfiles we know are dev-only", () => {
  assert.equal(shouldInclude(".gitignore"), false);
});

test("excludes the store-listings folder (long-form descriptions belong in the dashboard, not the zip)", () => {
  assert.equal(shouldInclude("store-listings/en.md"), false);
  assert.equal(shouldInclude("store-listings/ru.md"), false);
  assert.equal(shouldInclude("store-listings/README.md"), false);
});

test("excludes the test-fixtures folder (local-only e2e fixture)", () => {
  assert.equal(shouldInclude("test-fixtures/index.html"), false);
});

test("excludes the local SEO research doc", () => {
  assert.equal(shouldInclude("seo-research.md"), false);
});

test("excludes source maps", () => {
  assert.equal(shouldInclude("background.js.map"), false);
  assert.equal(shouldInclude("lib/detector.js.map"), false);
});

// ============================================================================
// Test the actual list against expected file count (sanity)
// ============================================================================

test("real extension tree includes a stable set of files", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const url = await import("node:url");
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const root = path.resolve(here, "..");

  function walk(dir, base = "") {
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (!shouldInclude(rel)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(full, rel));
      else if (e.isFile()) out.push(rel);
    }
    return out;
  }

  const files = walk(root).sort();
  // Sanity floor: at least these files are always shipped.
  for (const must of [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "options.html",
    "lib/detector.js",
    "lib/data.js",
    "lib/hangul.js",
    "lib/i18n.js",
    "_locales/en/messages.json",
    "_locales/ru/messages.json",
  ]) {
    assert.ok(files.includes(must), `missing ${must}`);
  }
  // And these MUST NOT be present.
  for (const forbidden of [
    "README.md",
    "PRIVACY.md",
    "package.json",
    "tools/package.mjs",
    "lib/build-models.mjs",
    "lib/detector.test.mjs",
    "lib/i18n.test.mjs",
    "data/layouts/en.json",
    "data/wordlists/en.txt",
    "store-listings/en.md",
    "store-listings/README.md",
  ]) {
    assert.ok(!files.includes(forbidden), `forbidden file ${forbidden} got included`);
  }
});
