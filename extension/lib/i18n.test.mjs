// Run with: node --test extension/lib/i18n.test.mjs
//
// Covers the pure parts of lib/i18n.js (locale resolution, t() lookup with
// substitutions) plus a structural check that every locale file has the same
// key set as the English master. Bootstrap()/getUiLocale()/setUiLocale()
// require a real chrome runtime and are exercised manually via Reload.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import {
  resolveLocaleSync,
  availableUiLocales,
  SUPPORTED_UI_LOCALES,
  RTL_LOCALES,
  t,
  __setActiveMessagesForTests,
  __resetForTests,
} from "../lib/i18n.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, "..", "_locales");

test("availableUiLocales: auto + every supported locale, in stable order", () => {
  const list = availableUiLocales();
  assert.equal(list.length, SUPPORTED_UI_LOCALES.length + 1, "auto + all SUPPORTED_UI_LOCALES");
  assert.equal(list[0].code, "auto");
  for (const code of SUPPORTED_UI_LOCALES) {
    assert.ok(list.some((x) => x.code === code), `missing ${code}`);
  }
});

test("availableUiLocales: every entry has a non-empty native name", () => {
  for (const { code, nativeName } of availableUiLocales()) {
    assert.ok(typeof nativeName === "string" && nativeName.length > 0, `empty nativeName for ${code}`);
  }
});

test("resolveLocaleSync: explicit override wins over browser lang", () => {
  assert.equal(resolveLocaleSync("ru", "en-US"), "ru");
  assert.equal(resolveLocaleSync("uk", "de-DE"), "uk");
  assert.equal(resolveLocaleSync("he", "en"), "he");
});

test("resolveLocaleSync: 'auto' falls back to browser lang base", () => {
  assert.equal(resolveLocaleSync("auto", "ru-RU"), "ru");
  assert.equal(resolveLocaleSync("auto", "de-DE"), "de");
  assert.equal(resolveLocaleSync("auto", "fr"), "fr");
  assert.equal(resolveLocaleSync(null, "uk"), "uk");
});

test("resolveLocaleSync: unsupported browser lang → en", () => {
  assert.equal(resolveLocaleSync("auto", "ja-JP"), "en");
  assert.equal(resolveLocaleSync("auto", "ja"), "en");
  assert.equal(resolveLocaleSync(null, "zh-CN"), "en");
});

test("resolveLocaleSync: empty/missing browser lang → en", () => {
  assert.equal(resolveLocaleSync("auto", ""), "en");
  assert.equal(resolveLocaleSync("auto", null), "en");
  assert.equal(resolveLocaleSync(undefined, undefined), "en");
});

test("resolveLocaleSync: invalid override falls back to browser lang", () => {
  // "ja" / "zh" aren't supported UI locales → fall through to browser lang.
  assert.equal(resolveLocaleSync("ja", "ru-RU"), "ru");
  assert.equal(resolveLocaleSync("zh", "uk"), "uk");
});

test("t: returns message from active messages", () => {
  __resetForTests();
  __setActiveMessagesForTests("en", { hello: { message: "Hello, $1!" } });
  assert.equal(t("hello", ["world"]), "Hello, world!");
});

test("t: leaves placeholder untouched when no subs supplied", () => {
  __resetForTests();
  __setActiveMessagesForTests("en", { hello: { message: "Hello, $1!" } });
  assert.equal(t("hello"), "Hello, $1!");
});

test("t: unknown key returns the key itself as fallback", () => {
  __resetForTests();
  __setActiveMessagesForTests("en", { hello: { message: "Hi" } });
  assert.equal(t("nonexistent"), "nonexistent");
});

test("t: handles multiple substitutions in any order", () => {
  __resetForTests();
  __setActiveMessagesForTests("en", { greet: { message: "$1 says hi to $2" } });
  assert.equal(t("greet", ["Alice", "Bob"]), "Alice says hi to Bob");
});

test("t: tolerates entries missing a 'message' field", () => {
  __resetForTests();
  __setActiveMessagesForTests("en", { broken: { description: "no message here" } });
  assert.equal(t("broken"), "broken");
});

test("RTL_LOCALES: only Hebrew is RTL", () => {
  assert.ok(RTL_LOCALES.has("he"));
  assert.ok(!RTL_LOCALES.has("en"));
  assert.ok(!RTL_LOCALES.has("ru"));
  assert.ok(!RTL_LOCALES.has("ar")); // we don't ship ar yet
});

test("every _locales/<code>/messages.json has the same keys as en (with non-empty messages)", () => {
  const enPath = path.join(LOCALES_DIR, "en", "messages.json");
  const enDict = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const enKeys = Object.keys(enDict).sort();
  assert.ok(enKeys.length > 50, `English master suspiciously small: ${enKeys.length} keys`);

  for (const code of SUPPORTED_UI_LOCALES) {
    if (code === "en") continue;
    const localePath = path.join(LOCALES_DIR, code, "messages.json");
    assert.ok(fs.existsSync(localePath), `missing _locales/${code}/messages.json`);
    const dict = JSON.parse(fs.readFileSync(localePath, "utf8"));
    const keys = Object.keys(dict).sort();
    assert.deepEqual(keys, enKeys, `keys differ in _locales/${code}/messages.json`);
    for (const k of keys) {
      assert.ok(
        typeof dict[k]?.message === "string" && dict[k].message.length > 0,
        `_locales/${code}/messages.json: key "${k}" has empty message`,
      );
    }
  }
});

test("manifest.json: name and description use __MSG_*__ tokens with default_locale", () => {
  const manifestPath = path.resolve(__dirname, "..", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.default_locale, "en", "default_locale must be 'en'");
  assert.match(manifest.name, /^__MSG_\w+__$/, "manifest.name must be a __MSG_*__ token");
  assert.match(manifest.description, /^__MSG_\w+__$/, "manifest.description must be a __MSG_*__ token");
  // Each token must resolve to a key in en/messages.json
  const enDict = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en", "messages.json"), "utf8"));
  for (const tok of [manifest.name, manifest.description, manifest.action.default_title]) {
    const m = /^__MSG_(\w+)__$/.exec(tok);
    if (!m) continue;
    assert.ok(enDict[m[1]], `manifest references __MSG_${m[1]}__ but en messages.json has no such key`);
  }
});
