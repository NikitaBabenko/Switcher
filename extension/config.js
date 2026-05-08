// All offline-bundled languages. Keep in sync with the trigram models in
// lib/data.js (auto-generated from data/{layouts,wordlists}/).
export const SUPPORTED_LANGUAGES = ["en", "ru", "uk", "be", "de", "fr", "el", "he", "tr"];

export const DEFAULTS = {
  // Offline-first: empty apiBase keeps text fully on the user's machine. Set a
  // URL in Settings only if you want extra languages or a remote fallback.
  apiBase: "",
  useApiFallback: false,
  languages: ["en", "ru"],
  replaceWholeOnEmptySelection: true,
  siteMode: "all", // "all" | "blacklist" | "whitelist"
  siteList: [], // hostnames; matched by exact equality or "endsWith ('.' + h)"
  // Auto-correction while typing: replace the just-typed word when it scores
  // better in the other layout. Off by default — opt-in for users who want
  // Punto-Switcher-style behaviour.
  autoCorrect: false,
  // UI language for popup/options. "auto" follows chrome.i18n.getUILanguage();
  // explicit codes (en, ru, uk, …) override and pin the chosen locale.
  uiLocale: "auto",
};

// True when the browser locale gives us enough signal to pick the user's
// language set without asking — i.e. we can identify ≥2 supported languages
// in navigator.languages. Used by background.js to decide whether to open the
// settings page on first install.
export function hasConfidentLanguageDetection(navigatorLanguages) {
  const tags = Array.isArray(navigatorLanguages) ? navigatorLanguages : [];
  const supported = new Set(SUPPORTED_LANGUAGES);
  const seen = new Set();
  for (const tag of tags) {
    const code = String(tag || "").toLowerCase().split("-")[0];
    if (supported.has(code)) seen.add(code);
    if (seen.size >= 2) return true;
  }
  return false;
}

// Pure, testable: derive a sensible initial language set from navigator.languages.
// Keeps only languages we ship offline, preserves the user's preference order,
// always tries to anchor English (if there's room), and falls back to en+ru if
// nothing maps. Caps at 4 to keep the detector responsive.
export function detectDefaultLanguages(navigatorLanguages) {
  const tags = Array.isArray(navigatorLanguages) ? navigatorLanguages : [];
  const supported = new Set(SUPPORTED_LANGUAGES);
  const seen = new Set();
  const picked = [];
  for (const tag of tags) {
    const code = String(tag || "").toLowerCase().split("-")[0];
    if (!supported.has(code) || seen.has(code)) continue;
    seen.add(code);
    picked.push(code);
    if (picked.length >= 4) break;
  }
  if (!seen.has("en") && picked.length < 4) picked.push("en");
  if (picked.length < 2) picked.push("ru");
  return picked;
}

const KEYS = Object.keys(DEFAULTS);
const MIGRATION_FLAG = "__migrated_v1";

// One-shot copy from chrome.storage.local → chrome.storage.sync so users don't
// lose their previous settings when we move to synced storage.
async function migrateOnce() {
  if (!chrome.storage?.sync) return;
  const sync = await chrome.storage.sync.get([MIGRATION_FLAG]);
  if (sync[MIGRATION_FLAG]) return;
  try {
    const local = await chrome.storage.local.get(KEYS);
    const patch = {};
    for (const k of KEYS) {
      if (local[k] !== undefined) patch[k] = local[k];
    }
    patch[MIGRATION_FLAG] = true;
    await chrome.storage.sync.set(patch);
  } catch {
    try { await chrome.storage.sync.set({ [MIGRATION_FLAG]: true }); } catch {}
  }
}

function normalizeSiteMode(v) {
  return v === "blacklist" || v === "whitelist" ? v : "all";
}

function normalizeSiteList(v) {
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
}

export async function getSettings() {
  await migrateOnce();
  const store = chrome.storage.sync || chrome.storage.local;
  const stored = await store.get(KEYS);
  return {
    apiBase: typeof stored.apiBase === "string" ? stored.apiBase : DEFAULTS.apiBase,
    useApiFallback: typeof stored.useApiFallback === "boolean" ? stored.useApiFallback : DEFAULTS.useApiFallback,
    languages: Array.isArray(stored.languages) && stored.languages.length > 0 ? stored.languages : DEFAULTS.languages,
    replaceWholeOnEmptySelection:
      typeof stored.replaceWholeOnEmptySelection === "boolean"
        ? stored.replaceWholeOnEmptySelection
        : DEFAULTS.replaceWholeOnEmptySelection,
    siteMode: normalizeSiteMode(stored.siteMode),
    siteList: normalizeSiteList(stored.siteList),
    autoCorrect: typeof stored.autoCorrect === "boolean" ? stored.autoCorrect : DEFAULTS.autoCorrect,
    uiLocale: typeof stored.uiLocale === "string" && stored.uiLocale.length > 0 ? stored.uiLocale : DEFAULTS.uiLocale,
  };
}

export async function saveSettings(patch) {
  const store = chrome.storage.sync || chrome.storage.local;
  await store.set(patch);
}

// True for URLs where Chrome refuses to inject content scripts (chrome://,
// chrome-extension:// of other extensions, edge://, view-source:, about:, the
// Chrome Web Store, etc.). On such pages REPLACE_IN_COMPOSER will always fail
// — callers should bail out early with a clearer "page not supported" message
// instead of falling through to the misleading notification_selectFirst toast.
export function isRestrictedUrl(url) {
  if (!url) return true;
  let parsed;
  try { parsed = new URL(url); } catch { return true; }
  const proto = parsed.protocol;
  if (
    proto === "chrome:" ||
    proto === "edge:" ||
    proto === "about:" ||
    proto === "view-source:" ||
    proto === "chrome-extension:" ||
    proto === "devtools:" ||
    proto === "chrome-search:"
  ) return true;
  const host = parsed.hostname.toLowerCase();
  if (host === "chromewebstore.google.com") return true;
  if (host === "chrome.google.com" && parsed.pathname.startsWith("/webstore")) return true;
  return false;
}

// True when the extension is allowed to act on the given hostname under the
// current siteMode/siteList policy. Pure function so it's testable.
export function isHostAllowed(hostname, siteMode, siteList) {
  if (!hostname) return true;
  hostname = hostname.toLowerCase();
  const list = normalizeSiteList(siteList);
  const matches = list.some((h) => hostname === h || hostname.endsWith("." + h));
  if (siteMode === "blacklist") return !matches;
  if (siteMode === "whitelist") return matches;
  return true;
}
