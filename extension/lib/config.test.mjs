// Run with: node --test extension/lib/config.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { isHostAllowed } from "../config.js";

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
