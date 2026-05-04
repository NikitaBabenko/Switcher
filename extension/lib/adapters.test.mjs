// Run with: node --test extension/lib/adapters.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { loadAdapters, makeMockDocument } from "./test-helpers.mjs";

function pick({ hostname, pathname = "/", document, override }) {
  const adapters = loadAdapters({ hostname, pathname, document });
  return adapters.pickAdapter(override);
}

test("vk-im wins over vk on /im paths (registry order)", () => {
  assert.equal(pick({ hostname: "vk.com", pathname: "/im?sel=12345" }).id, "vk-im");
  assert.equal(pick({ hostname: "vk.com", pathname: "/im/users/123" }).id, "vk-im");
  assert.equal(pick({ hostname: "vk.com", pathname: "/messages" }).id, "vk-im");
});

test("vk on non-/im paths", () => {
  assert.equal(pick({ hostname: "vk.com", pathname: "/feed" }).id, "vk");
  assert.equal(pick({ hostname: "vk.com", pathname: "/" }).id, "vk");
  assert.equal(pick({ hostname: "m.vk.com", pathname: "/feed" }).id, "vk");
});

test("twitter matches both x.com and twitter.com", () => {
  assert.equal(pick({ hostname: "x.com" }).id, "twitter");
  assert.equal(pick({ hostname: "twitter.com" }).id, "twitter");
  assert.equal(pick({ hostname: "mobile.twitter.com" }).id, "twitter");
});

test("facebook variants", () => {
  assert.equal(pick({ hostname: "facebook.com" }).id, "facebook");
  assert.equal(pick({ hostname: "m.facebook.com" }).id, "facebook");
  assert.equal(pick({ hostname: "www.facebook.com" }).id, "facebook");
});

test("messenger.com matches messenger before facebook", () => {
  assert.equal(pick({ hostname: "messenger.com" }).id, "messenger");
});

test("instagram matches", () => {
  assert.equal(pick({ hostname: "instagram.com" }).id, "instagram");
});

test("telegram web", () => {
  assert.equal(pick({ hostname: "web.telegram.org" }).id, "telegram");
});

test("whatsapp web", () => {
  assert.equal(pick({ hostname: "web.whatsapp.com" }).id, "whatsapp");
});

test("discord", () => {
  assert.equal(pick({ hostname: "discord.com" }).id, "discord");
  assert.equal(pick({ hostname: "ptb.discord.com" }).id, "discord");
});

test("slack — only hosts under slack.com", () => {
  assert.equal(pick({ hostname: "app.slack.com" }).id, "slack");
  assert.equal(pick({ hostname: "slack.com" }).id, "slack");
});

test("reddit variants", () => {
  assert.equal(pick({ hostname: "reddit.com" }).id, "reddit");
  assert.equal(pick({ hostname: "new.reddit.com" }).id, "reddit");
  assert.equal(pick({ hostname: "sh.reddit.com" }).id, "reddit");
});

test("linkedin", () => {
  assert.equal(pick({ hostname: "linkedin.com" }).id, "linkedin");
  assert.equal(pick({ hostname: "www.linkedin.com" }).id, "linkedin");
});

test("twitch", () => {
  assert.equal(pick({ hostname: "twitch.tv" }).id, "twitch");
  assert.equal(pick({ hostname: "www.twitch.tv" }).id, "twitch");
});

test("known mastodon instances", () => {
  assert.equal(pick({ hostname: "mastodon.social" }).id, "mastodon");
  assert.equal(pick({ hostname: "mastodon.online" }).id, "mastodon");
  assert.equal(pick({ hostname: "mas.to" }).id, "mastodon");
  assert.equal(pick({ hostname: "fosstodon.org" }).id, "mastodon");
  assert.equal(pick({ hostname: "hachyderm.io" }).id, "mastodon");
});

test("mastodon DOM heuristic catches arbitrary instances", () => {
  // Random hostname, but the page has Mastodon's compose form selector → match.
  const doc = makeMockDocument({
    querySelector: (sel) => sel.includes("compose-form") ? {} : null,
  });
  const a = pick({ hostname: "social.example.org", document: doc });
  assert.equal(a.id, "mastodon");
});

test("unknown host falls through to generic", () => {
  assert.equal(pick({ hostname: "unknown.example.com" }).id, "generic");
  assert.equal(pick({ hostname: "myblog.dev" }).id, "generic");
});

test("override 'twitter' wins on any host", () => {
  assert.equal(pick({ hostname: "vk.com", pathname: "/im", override: "twitter" }).id, "twitter");
  assert.equal(pick({ hostname: "unknown.com", override: "twitter" }).id, "twitter");
});

test("override 'auto' is treated like absence", () => {
  assert.equal(pick({ hostname: "twitter.com", override: "auto" }).id, "twitter");
});

test("override 'generic' is honoured", () => {
  assert.equal(pick({ hostname: "twitter.com", override: "generic" }).id, "generic");
});

test("override pointing at unknown id falls back to auto", () => {
  // Unknown override is ignored — the auto-detect path picks twitter.
  assert.equal(pick({ hostname: "twitter.com", override: "klingon" }).id, "twitter");
});

test("each adapter exposes the required interface", () => {
  const adapters = loadAdapters({ hostname: "twitter.com" });
  for (const a of adapters.registry) {
    assert.equal(typeof a.id, "string");
    assert.equal(typeof a.match, "function");
    assert.equal(typeof a.getEditable, "function");
    assert.equal(typeof a.getText, "function");
    assert.equal(typeof a.replaceSelection, "function");
    assert.equal(typeof a.replaceAll, "function");
  }
  assert.equal(typeof adapters.generic.id, "string");
});

test("registry order: vk-im appears before vk", () => {
  const adapters = loadAdapters({ hostname: "vk.com" });
  const ids = adapters.registry.map((a) => a.id);
  const vkIm = ids.indexOf("vk-im");
  const vk = ids.indexOf("vk");
  assert.ok(vkIm >= 0 && vk >= 0, "both adapters should exist");
  assert.ok(vkIm < vk, `vk-im (${vkIm}) must come before vk (${vk})`);
});
