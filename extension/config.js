export const DEFAULTS = {
  // Offline-first: empty apiBase keeps text fully on the user's machine. Set a
  // URL in Settings only if you want extra languages or a remote fallback.
  apiBase: "",
  useApiFallback: false,
  languages: ["en", "ru"],
  replaceWholeOnEmptySelection: true,
  siteMode: "all", // "all" | "blacklist" | "whitelist"
  siteList: [], // hostnames; matched by exact equality or "endsWith ('.' + h)"
};

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
