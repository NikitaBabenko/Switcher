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
};

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
  };
}

export async function saveSettings(patch) {
  const store = chrome.storage.sync || chrome.storage.local;
  await store.set(patch);
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
