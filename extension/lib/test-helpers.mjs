// Shared test helpers: load IIFE content scripts inside a node:vm context
// with mocked browser globals so we can poke at their exposed APIs without a
// real browser. Production code is unchanged; only test files import this.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import vm from "node:vm";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const EXT_ROOT = path.resolve(__dirname, "..");

export function makeMockChrome(overrides = {}) {
  const storage = {
    sync: {
      _data: {},
      async get(keys) {
        const out = {};
        if (!keys) return { ...this._data };
        const arr = Array.isArray(keys) ? keys : [keys];
        for (const k of arr) if (k in this._data) out[k] = this._data[k];
        return out;
      },
      async set(patch) { Object.assign(this._data, patch); },
    },
    onChanged: { addListener() {} },
  };
  const runtime = {
    onMessage: { addListener() {} },
    sendMessage: async () => ({}),
  };
  return { storage, runtime, ...overrides };
}

export function makeMockDocument(overrides = {}) {
  return {
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    activeElement: null,
    queryCommandSupported: () => false,
    execCommand: () => false,
    createRange: () => ({}),
    createTextNode: (data) => ({ nodeType: 3, data }),
    ownerDocument: null,
    defaultView: null,
    ...overrides,
  };
}

const NODE_CONSTANTS = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9,
};

export function makeContext({ hostname = "example.com", pathname = "/", chrome, document, replace, adapters, extras = {} } = {}) {
  const ctx = {
    console,
    setTimeout,
    clearTimeout,
    Date,
    Math,
    Object,
    Array,
    Map,
    Set,
    WeakMap,
    WeakRef: globalThis.WeakRef ?? class { constructor(v) { this.v = v; } deref() { return this.v; } },
    JSON,
    String,
    Number,
    Boolean,
    Symbol,
    RegExp,
    Error,
    Promise,
    InputEvent: class InputEvent { constructor(type, init = {}) { this.type = type; Object.assign(this, init); } },
    Event: class Event { constructor(type, init = {}) { this.type = type; Object.assign(this, init); } },
    Node: NODE_CONSTANTS,
    location: { hostname, pathname },
    document: document ?? makeMockDocument(),
    window: undefined, // assigned below
    chrome: chrome ?? makeMockChrome(),
    ...extras,
  };
  ctx.window = {
    getSelection: () => null,
    ...((extras && extras.window) || {}),
  };
  ctx.globalThis = ctx;
  if (replace !== undefined) ctx.__SwitcherReplace = replace;
  if (adapters !== undefined) ctx.__SwitcherAdapters = adapters;
  return vm.createContext(ctx);
}

export function loadScript(relPath, ctx) {
  const code = fs.readFileSync(path.join(EXT_ROOT, relPath), "utf8");
  vm.runInContext(code, ctx, { filename: relPath });
  return ctx;
}

// Convenience: returns __SwitcherReplace after loading content/replace.js.
export function loadReplace(extras = {}) {
  const ctx = makeContext(extras);
  loadScript("content/replace.js", ctx);
  return ctx.__SwitcherReplace;
}

// Convenience: returns __SwitcherAdapters after loading content/replace.js +
// content/adapters.js. The adapters module requires __SwitcherReplace to be
// present at load time.
export function loadAdapters(extras = {}) {
  const ctx = makeContext(extras);
  loadScript("content/replace.js", ctx);
  loadScript("content/adapters.js", ctx);
  return ctx.__SwitcherAdapters;
}

// Convenience: returns the autocorrect __Internals + the context (so tests
// can mutate settings between calls).
export function loadAutocorrect(extras = {}) {
  const ctx = makeContext(extras);
  loadScript("content/replace.js", ctx);
  loadScript("content/autocorrect.js", ctx);
  return { internals: ctx.__SwitcherAutocorrectInternals, ctx };
}

// Convenience for content.js (undo memory). Returns the VM context — tests
// reach `rememberChange`/`canUndo`/`undoLastChange` via the returned context
// because they are top-level function declarations.
export function loadContentMain(extras = {}) {
  const ctx = makeContext(extras);
  loadScript("content/replace.js", ctx);
  loadScript("content/adapters.js", ctx);
  loadScript("content/autocorrect.js", ctx);
  loadScript("content.js", ctx);
  return ctx;
}
