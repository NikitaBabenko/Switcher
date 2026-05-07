// Tiny i18n wrapper on top of chrome.i18n. The native chrome.i18n always uses
// the browser UI language; we add an explicit user-facing override stored in
// chrome.storage.sync (`uiLocale`). When the override is "auto", we fall back
// to chrome.i18n.getUILanguage(). Otherwise we fetch the chosen locale's
// messages.json directly via chrome.runtime.getURL and look up keys from it.
//
// HTML pages mark strings with `data-i18n="key"` (textContent),
// `data-i18n-placeholder="key"` (placeholder), or `data-i18n-title="key"`.
// `bootstrap()` swaps them on DOMContentLoaded. JS uses `t(key, [subs])`.

import { getSettings, saveSettings } from "../config.js";

export const SUPPORTED_UI_LOCALES = ["en", "ru", "uk", "be", "de", "fr", "el", "he", "tr"];
export const RTL_LOCALES = new Set(["he"]);

const _cache = new Map(); // locale code -> messages dict
let _activeMessages = null;
let _activeLocale = "en";

export function availableUiLocales() {
  return [
    { code: "auto", nativeName: "Auto (browser language)" },
    { code: "en", nativeName: "English" },
    { code: "ru", nativeName: "Русский" },
    { code: "uk", nativeName: "Українська" },
    { code: "be", nativeName: "Беларуская" },
    { code: "de", nativeName: "Deutsch" },
    { code: "fr", nativeName: "Français" },
    { code: "el", nativeName: "Ελληνικά" },
    { code: "he", nativeName: "עברית" },
    { code: "tr", nativeName: "Türkçe" },
  ];
}

export async function getUiLocale() {
  try {
    const { uiLocale } = await getSettings();
    return uiLocale || "auto";
  } catch {
    return "auto";
  }
}

export async function setUiLocale(code) {
  await saveSettings({ uiLocale: code });
}

// Resolve "auto" to a concrete supported locale via chrome.i18n; otherwise
// trust the explicit override (validated against SUPPORTED_UI_LOCALES).
export function resolveLocaleSync(setting, browserLang) {
  if (setting && setting !== "auto" && SUPPORTED_UI_LOCALES.includes(setting)) {
    return setting;
  }
  const base = (browserLang || "en").toLowerCase().split("-")[0];
  return SUPPORTED_UI_LOCALES.includes(base) ? base : "en";
}

async function loadMessages(code) {
  if (_cache.has(code)) return _cache.get(code);
  try {
    const url = chrome.runtime.getURL(`_locales/${code}/messages.json`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dict = await res.json();
    _cache.set(code, dict);
    return dict;
  } catch {
    if (code !== "en") return loadMessages("en"); // hard fallback
    return {};
  }
}

// Synchronous lookup. Must be called AFTER bootstrap() (or after t() is
// preloaded via loadMessagesSyncFor — useful in tests).
export function t(key, subs = []) {
  const entry = _activeMessages?.[key];
  if (!entry?.message) return key;
  let out = entry.message;
  if (Array.isArray(subs) && subs.length > 0) {
    subs.forEach((v, i) => {
      out = out.split(`$${i + 1}`).join(String(v ?? ""));
    });
  }
  return out;
}

export function getActiveLocale() {
  return _activeLocale;
}

// Walk the DOM and replace text/placeholder/title for any [data-i18n*].
function applyToDocument(rootDoc) {
  if (!rootDoc) return;
  rootDoc.documentElement.lang = _activeLocale;
  rootDoc.documentElement.dir = RTL_LOCALES.has(_activeLocale) ? "rtl" : "ltr";
  for (const el of rootDoc.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of rootDoc.querySelectorAll("[data-i18n-placeholder]")) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
  for (const el of rootDoc.querySelectorAll("[data-i18n-title]")) {
    el.title = t(el.dataset.i18nTitle);
  }
  for (const el of rootDoc.querySelectorAll("[data-i18n-aria-label]")) {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  }
}

// Public bootstrap — call once at the top of a popup/options script.
// Resolves the active locale (override > Chrome UI lang), preloads its
// messages, and rewrites any [data-i18n*] markers in the given document.
export async function bootstrap(rootDoc = (typeof document !== "undefined" ? document : null)) {
  const setting = await getUiLocale();
  const browserLang = (typeof chrome !== "undefined" && chrome.i18n?.getUILanguage)
    ? chrome.i18n.getUILanguage()
    : "en";
  _activeLocale = resolveLocaleSync(setting, browserLang);
  _activeMessages = await loadMessages(_activeLocale);
  applyToDocument(rootDoc);
  return _activeLocale;
}

// Test-only helper: drop the messages cache and reset the active state so
// successive bootstrap() calls hit fresh storage.
export function __resetForTests() {
  _cache.clear();
  _activeMessages = null;
  _activeLocale = "en";
}

// Test-only helper: inject a messages dict directly without going through
// chrome.runtime.getURL. Use to preload messages before calling t() in unit
// tests without spinning up an actual extension context.
export function __setActiveMessagesForTests(locale, dict) {
  _activeLocale = locale;
  _activeMessages = dict;
  _cache.set(locale, dict);
}
