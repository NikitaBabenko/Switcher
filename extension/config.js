export const DEFAULTS = {
  apiBase: "http://localhost:5050",
  languages: ["en", "ru"],
  defaultTarget: null,
};

export async function getSettings() {
  const stored = await chrome.storage.local.get(["apiBase", "languages", "defaultTarget"]);
  return {
    apiBase: stored.apiBase || DEFAULTS.apiBase,
    languages: Array.isArray(stored.languages) && stored.languages.length > 0 ? stored.languages : DEFAULTS.languages,
    defaultTarget: stored.defaultTarget ?? null,
  };
}

export async function saveSettings(patch) {
  await chrome.storage.local.set(patch);
}
