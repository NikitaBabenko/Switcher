// Run with: node --test extension/lib/config.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { isHostAllowed, isRestrictedUrl, detectDefaultLanguages, hasConfidentLanguageDetection } from "../config.js";

test("default mode 'all' allows everything", () => {
  assert.equal(isHostAllowed("example.com", "all", []), true);
  assert.equal(isHostAllowed("example.com", "all", ["example.com"]), true);
});

test("blacklist excludes exact host", () => {
  assert.equal(isHostAllowed("example.com", "blacklist", ["example.com"]), false);
  assert.equal(isHostAllowed("other.com", "blacklist", ["example.com"]), true);
});

test("blacklist excludes by suffix match", () => {
  assert.equal(isHostAllowed("m.vk.com", "blacklist", ["vk.com"]), false);
  assert.equal(isHostAllowed("login.vk.com", "blacklist", ["vk.com"]), false);
  assert.equal(isHostAllowed("vk.community.com", "blacklist", ["vk.com"]), true);
});

test("whitelist allows only listed hosts", () => {
  assert.equal(isHostAllowed("example.com", "whitelist", ["example.com"]), true);
  assert.equal(isHostAllowed("other.com", "whitelist", ["example.com"]), false);
  assert.equal(isHostAllowed("m.example.com", "whitelist", ["example.com"]), true);
});

test("whitelist with empty list rejects everything", () => {
  assert.equal(isHostAllowed("example.com", "whitelist", []), false);
});

test("hostname matching is case-insensitive", () => {
  assert.equal(isHostAllowed("Example.COM", "blacklist", ["EXAMPLE.com"]), false);
});

test("non-string sitelist entries are ignored", () => {
  assert.equal(isHostAllowed("example.com", "blacklist", [null, undefined, "", "example.com"]), false);
});

test("missing hostname is permissive", () => {
  assert.equal(isHostAllowed("", "blacklist", ["anything"]), true);
});

test("invalid mode falls back to permissive", () => {
  // Anything other than blacklist/whitelist is treated like "all".
  assert.equal(isHostAllowed("example.com", "garbage", ["example.com"]), true);
});

test("subdomain-of-subdomain match", () => {
  assert.equal(isHostAllowed("a.b.example.com", "blacklist", ["example.com"]), false);
  assert.equal(isHostAllowed("a.b.example.com", "whitelist", ["b.example.com"]), true);
});

test("near-miss does not falsely match", () => {
  // "evilexample.com" should not be considered a subdomain of "example.com".
  assert.equal(isHostAllowed("evilexample.com", "blacklist", ["example.com"]), true);
});

test("detectDefaultLanguages: empty/missing input falls back to en+ru", () => {
  assert.deepEqual(detectDefaultLanguages([]), ["en", "ru"]);
  assert.deepEqual(detectDefaultLanguages(), ["en", "ru"]);
  assert.deepEqual(detectDefaultLanguages(null), ["en", "ru"]);
  assert.deepEqual(detectDefaultLanguages(undefined), ["en", "ru"]);
});

test("detectDefaultLanguages: preserves user preference order", () => {
  assert.deepEqual(detectDefaultLanguages(["ru", "en-US"]), ["ru", "en"]);
  assert.deepEqual(detectDefaultLanguages(["de-DE", "en"]), ["de", "en"]);
  assert.deepEqual(detectDefaultLanguages(["fr", "de"]), ["fr", "de", "en"]);
});

test("detectDefaultLanguages: appends English as anchor when missing and has room", () => {
  assert.deepEqual(detectDefaultLanguages(["de"]), ["de", "en"]);
  assert.deepEqual(detectDefaultLanguages(["ru"]), ["ru", "en"]);
  assert.deepEqual(detectDefaultLanguages(["ru", "uk", "be"]), ["ru", "uk", "be", "en"]);
});

test("detectDefaultLanguages: drops unsupported tags", () => {
  assert.deepEqual(detectDefaultLanguages(["es", "ja", "ru"]), ["ru", "en"]);
  assert.deepEqual(detectDefaultLanguages(["es", "ja"]), ["en", "ru"]);
});

test("detectDefaultLanguages: lowercases and strips region", () => {
  assert.deepEqual(detectDefaultLanguages(["RU"]), ["ru", "en"]);
  assert.deepEqual(detectDefaultLanguages(["EN-GB", "RU-RU"]), ["en", "ru"]);
});

test("detectDefaultLanguages: caps at 4 preferred languages", () => {
  // 4 user prefs already: keep them, no room for English anchor.
  assert.deepEqual(detectDefaultLanguages(["fr", "de", "ru", "uk"]), ["fr", "de", "ru", "uk"]);
  // 5+: keep first 4 in preference order.
  assert.deepEqual(detectDefaultLanguages(["fr", "de", "ru", "uk", "be"]), ["fr", "de", "ru", "uk"]);
});

test("detectDefaultLanguages: dedupes across regional variants", () => {
  assert.deepEqual(detectDefaultLanguages(["en-US", "en-GB", "en"]), ["en", "ru"]);
});

test("detectDefaultLanguages: ignores junk entries", () => {
  assert.deepEqual(detectDefaultLanguages([null, "", undefined, "ru"]), ["ru", "en"]);
  assert.deepEqual(detectDefaultLanguages([0, false, "ru"]), ["ru", "en"]);
});

test("hasConfidentLanguageDetection: ≥2 supported tags → true", () => {
  assert.equal(hasConfidentLanguageDetection(["ru", "en-US"]), true);
  assert.equal(hasConfidentLanguageDetection(["de-DE", "fr"]), true);
  assert.equal(hasConfidentLanguageDetection(["uk", "ru", "en"]), true);
});

test("hasConfidentLanguageDetection: only one supported → false", () => {
  assert.equal(hasConfidentLanguageDetection(["en"]), false);
  assert.equal(hasConfidentLanguageDetection(["ru"]), false);
  assert.equal(hasConfidentLanguageDetection(["en-US", "es", "ja"]), false);
});

test("hasConfidentLanguageDetection: empty/junk → false", () => {
  assert.equal(hasConfidentLanguageDetection([]), false);
  assert.equal(hasConfidentLanguageDetection(), false);
  assert.equal(hasConfidentLanguageDetection(null), false);
  assert.equal(hasConfidentLanguageDetection([null, "", "es"]), false);
});

test("hasConfidentLanguageDetection: regional variants count once", () => {
  // en-US + en-GB are the same supported language → not enough by themselves.
  assert.equal(hasConfidentLanguageDetection(["en-US", "en-GB", "en"]), false);
  assert.equal(hasConfidentLanguageDetection(["en-US", "en-GB", "ru"]), true);
});

test("isRestrictedUrl: chrome:// and other privileged schemes are restricted", () => {
  assert.equal(isRestrictedUrl("chrome://extensions"), true);
  assert.equal(isRestrictedUrl("chrome://settings/"), true);
  assert.equal(isRestrictedUrl("edge://settings"), true);
  assert.equal(isRestrictedUrl("about:blank"), true);
  assert.equal(isRestrictedUrl("view-source:https://example.com"), true);
  assert.equal(isRestrictedUrl("chrome-extension://abcdefg/popup.html"), true);
  assert.equal(isRestrictedUrl("devtools://devtools/bundled/inspector.html"), true);
});

test("isRestrictedUrl: Chrome Web Store hostnames are restricted", () => {
  assert.equal(isRestrictedUrl("https://chromewebstore.google.com/category/extensions"), true);
  assert.equal(isRestrictedUrl("https://chrome.google.com/webstore/detail/abc"), true);
});

test("isRestrictedUrl: regular http/https are allowed", () => {
  assert.equal(isRestrictedUrl("https://example.com/"), false);
  assert.equal(isRestrictedUrl("http://localhost:3000"), false);
  assert.equal(isRestrictedUrl("https://chrome.google.com/"), false); // store path needed
  assert.equal(isRestrictedUrl("https://www.google.com/"), false);
});

test("isRestrictedUrl: missing/garbage url is treated as restricted", () => {
  assert.equal(isRestrictedUrl(""), true);
  assert.equal(isRestrictedUrl(null), true);
  assert.equal(isRestrictedUrl(undefined), true);
  assert.equal(isRestrictedUrl("not a url"), true);
});
