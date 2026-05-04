// Per-site adapter registry. Each adapter knows where the composer lives;
// the actual insertion lives in __SwitcherReplace and is shared.
(function () {
  const R = globalThis.__SwitcherReplace;
  if (!R) return;

  function makeAdapter(id, match, selectors) {
    return {
      id,
      match,
      selectors,
      getEditable() {
        const active = R.findActiveEditable();
        if (active) {
          for (const sel of selectors) {
            try { if (active.matches && active.matches(sel)) return active; } catch {}
          }
          // Active editable is something else, but on a known site we still
          // prefer the focused field if it is generally editable.
          if (R.isEditable(active)) return active;
        }
        return R.queryDeepFirst(selectors);
      },
      getText: (el) => R.readText(el),
      replaceSelection: (el, text) => R.replaceInElement(el, text, "selection"),
      replaceAll: (el, text) => R.replaceInElement(el, text, "whole"),
    };
  }

  const hostMatch = (...hosts) => (hostname) =>
    hosts.some((h) => hostname === h || hostname.endsWith("." + h));

  const generic = {
    id: "generic",
    match: () => true,
    getEditable() {
      const active = R.findActiveEditable();
      if (active) return active;
      return null;
    },
    getText: (el) => R.readText(el),
    replaceSelection: (el, text) => R.replaceInElement(el, text, "selection"),
    replaceAll: (el, text) => R.replaceInElement(el, text, "whole"),
  };

  // Registry order matters: more specific matches MUST come before more general
  // ones (e.g. vk-im before vk).
  const registry = [
    makeAdapter("twitter", hostMatch("x.com", "twitter.com"), [
      '[data-testid="tweetTextarea_0"] [contenteditable="true"]',
      '[data-testid^="tweetTextarea_"] [contenteditable="true"]',
      '[data-testid="dmComposerTextInput"] [contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
    ]),

    makeAdapter("messenger", hostMatch("messenger.com"), [
      '[role="textbox"][contenteditable="true"]',
      'div[aria-label][contenteditable="true"]',
    ]),

    makeAdapter("facebook", hostMatch("facebook.com", "m.facebook.com"), [
      '[role="textbox"][contenteditable="true"]',
      'div[aria-label][contenteditable="true"]',
    ]),

    {
      id: "vk-im",
      match: (hostname, pathname) =>
        hostMatch("vk.com", "vk.ru")(hostname) && /^\/(im|messages)/.test(pathname || ""),
      selectors: [
        '.im-chat-input__editable[contenteditable="true"]',
        '[data-testid="im_input"] [contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]',
      ],
      getEditable() {
        const sels = this.selectors;
        const active = R.findActiveEditable();
        if (active) {
          for (const s of sels) { try { if (active.matches?.(s)) return active; } catch {} }
          if (R.isEditable(active)) return active;
        }
        return R.queryDeepFirst(sels);
      },
      getText: (el) => R.readText(el),
      replaceSelection: (el, text) => R.replaceInElement(el, text, "selection"),
      replaceAll: (el, text) => R.replaceInElement(el, text, "whole"),
    },

    makeAdapter("vk", hostMatch("vk.com", "vk.ru"), [
      '.ProseMirror',
      '[data-testid*="post"] [contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
      'textarea',
    ]),

    makeAdapter("instagram", hostMatch("instagram.com"), [
      '[role="textbox"][contenteditable="true"]',
      'textarea[aria-label]',
    ]),

    makeAdapter("telegram", hostMatch("web.telegram.org"), [
      'div.input-message-input[contenteditable="true"]',
      '[contenteditable="true"][data-tid="messageInput"]',
      '[contenteditable="true"][role="textbox"]',
    ]),

    makeAdapter("whatsapp", hostMatch("web.whatsapp.com"), [
      'footer [contenteditable="true"][role="textbox"]',
      '[contenteditable="true"][role="textbox"]',
    ]),

    makeAdapter("discord", hostMatch("discord.com"), [
      '[role="textbox"][data-slate-editor="true"]',
      '[role="textbox"][contenteditable="true"]',
    ]),

    makeAdapter("slack", hostMatch("slack.com"), [
      '.ql-editor[contenteditable="true"]',
      '[data-qa="message_input"] [contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
    ]),

    makeAdapter("reddit", hostMatch("reddit.com"), [
      'div.public-DraftEditor-content[contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
      'textarea[name="text"]',
      'textarea[name="title"]',
    ]),

    makeAdapter("linkedin", hostMatch("linkedin.com"), [
      '.ql-editor[contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
    ]),

    makeAdapter("twitch", hostMatch("twitch.tv"), [
      'textarea[data-a-target="chat-input"]',
      '[data-a-target="chat-input"]',
      '[contenteditable="true"][role="textbox"]',
    ]),

    {
      id: "mastodon",
      match: (hostname) => {
        const known = ["mastodon.social", "mastodon.online", "mas.to", "fosstodon.org", "hachyderm.io"];
        if (known.some((h) => hostname === h || hostname.endsWith("." + h))) return true;
        try {
          if (document.querySelector('.compose-form, .compose-form__textarea')) return true;
        } catch {}
        return false;
      },
      selectors: [
        'textarea.compose-form__textarea',
        '[contenteditable="true"][role="textbox"]',
      ],
      getEditable() {
        const sels = this.selectors;
        const active = R.findActiveEditable();
        if (active) {
          for (const s of sels) { try { if (active.matches?.(s)) return active; } catch {} }
          if (R.isEditable(active)) return active;
        }
        return R.queryDeepFirst(sels);
      },
      getText: (el) => R.readText(el),
      replaceSelection: (el, text) => R.replaceInElement(el, text, "selection"),
      replaceAll: (el, text) => R.replaceInElement(el, text, "whole"),
    },
  ];

  function pickAdapter(overrideId) {
    if (overrideId && overrideId !== "auto") {
      if (overrideId === "generic") return generic;
      const m = registry.find((a) => a.id === overrideId);
      if (m) return m;
    }
    const hostname = location.hostname;
    const pathname = location.pathname;
    for (const a of registry) {
      try { if (a.match(hostname, pathname)) return a; } catch {}
    }
    return generic;
  }

  globalThis.__SwitcherAdapters = { registry, generic, pickAdapter };
})();
