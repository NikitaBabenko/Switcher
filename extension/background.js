import { getSettings, isHostAllowed, detectDefaultLanguages } from "./config.js";
import { detect as detectLocal, canHandleLanguages } from "./lib/detector.js";

const MENU_ID = "switcher-convert-selection";
const DEFAULTS_FLAG = "__defaults_v1";

chrome.runtime.onInstalled.addListener(async (details) => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Switcher: switch layout",
    contexts: ["selection", "editable"],
  });
  if (details?.reason === "install") {
    await applyDetectedDefaults();
  }
});

// Seed `languages` from navigator.languages on first install only. Idempotent
// via __defaults_v1 flag; never overwrites an existing user choice.
async function applyDetectedDefaults() {
  const store = chrome.storage?.sync || chrome.storage?.local;
  if (!store) return;
  try {
    const stored = await store.get([DEFAULTS_FLAG, "languages"]);
    if (stored[DEFAULTS_FLAG]) return;
    if (Array.isArray(stored.languages) && stored.languages.length > 0) {
      await store.set({ [DEFAULTS_FLAG]: true });
      return;
    }
    const tags = navigator.languages?.length
      ? Array.from(navigator.languages)
      : [navigator.language || "en"];
    const languages = detectDefaultLanguages(tags);
    await store.set({ languages, [DEFAULTS_FLAG]: true });
  } catch {
    // Storage unavailable — keep DEFAULTS.languages as the runtime fallback.
  }
}

// Clear per-tab override entries when their tab closes — otherwise
// chrome.storage.session accrues `override_<tabId>` keys for the session.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (!chrome.storage?.session) return;
  try { await chrome.storage.session.remove([`override_${tabId}`]); } catch {}
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  await convertInActiveTab(tab.id, tab.url, info.selectionText ?? "");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "convert-selection") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await convertInActiveTab(tab.id, tab.url, "");
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "CONVERT_TEXT") {
    convert(msg.text, msg.override).then(sendResponse).catch((e) => sendResponse({ error: String(e) }));
    return true;
  }
});

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

async function convertInActiveTab(tabId, tabUrl, fallbackText) {
  const settings = await getSettings();
  const replaceWholeOnEmptySelection = settings.replaceWholeOnEmptySelection !== false;
  const hostname = hostnameOf(tabUrl);

  if (!isHostAllowed(hostname, settings.siteMode, settings.siteList)) {
    await notify("VibeNest Switcher", `Skipped: ${hostname} is excluded by your site policy.`);
    return;
  }

  // Resolve per-tab override (popup may have set one).
  let override = "auto";
  try {
    if (chrome.storage?.session) {
      const stored = await chrome.storage.session.get([`override_${tabId}`]);
      override = stored[`override_${tabId}`] ?? "auto";
    }
  } catch { /* ignore */ }

  // Try the rich path first: content script will pick the adapter, read text,
  // call back for conversion, and write the result into the focused composer.
  let res;
  try {
    res = await chrome.tabs.sendMessage(tabId, {
      type: "REPLACE_IN_COMPOSER",
      override,
      replaceWholeOnEmptySelection,
    });
  } catch {
    res = null; // content script not loaded (chrome://, PDF viewer, etc.)
  }

  if (res?.ok) {
    const det = res.detected ? `${res.detected.from}→${res.detected.to}` : "decrypted";
    await tryToast(tabId, `Switcher: ${det}`, "ok");
    return;
  }

  if (res?.reason === "already-correct") {
    await tryToast(tabId, "Switcher: layout was already correct", "warn");
    return;
  }

  // We have a converted result but couldn't write it back — clipboard fallback.
  if (res && res.result) {
    await copyToClipboard(tabId, res.result);
    await notify("VibeNest Switcher", `Copied to clipboard: ${truncate(res.result, 80)}`);
    return;
  }

  // Composer not found / not editable / empty / no-selection / convert error.
  // If the user invoked from the context menu over selected text, honour that
  // text via the original GET_SELECTION → CONVERT → clipboard path.
  let textToConvert = (fallbackText || "").trim();

  if (!textToConvert) {
    try {
      const sel = await chrome.tabs.sendMessage(tabId, { type: "GET_SELECTION" });
      if (sel?.text?.trim()) textToConvert = sel.text.trim();
    } catch { /* ignore */ }
  }

  if (!textToConvert) {
    if (res?.reason === "convert-error" && res.error) {
      await notify("VibeNest Switcher", `Error: ${res.error}`);
    } else {
      await notify("VibeNest Switcher", "Select some text first, or click into a text field.");
    }
    return;
  }

  const conv = await convert(textToConvert);
  if (conv?.error) {
    await notify("VibeNest Switcher", `Error: ${conv.error}`);
    return;
  }
  if (!conv?.swapped) {
    await tryToast(tabId, "Switcher: layout was already correct", "warn");
    return;
  }

  // Try in-place replacement of the selection (works on plain pages even when
  // there's no adapter match — e.g. <textarea> on a random forum).
  let replaced = false;
  try {
    const r = await chrome.tabs.sendMessage(tabId, { type: "REPLACE_SELECTION", text: conv.result });
    replaced = !!r?.ok;
  } catch {
    replaced = false;
  }

  if (replaced) {
    const det = conv.detected ? `${conv.detected.from}→${conv.detected.to}` : "decrypted";
    await tryToast(tabId, `Switcher: ${det}`, "ok");
  } else {
    await copyToClipboard(tabId, conv.result);
    await notify("VibeNest Switcher", `Copied to clipboard: ${truncate(conv.result, 80)}`);
  }
}

async function convert(text, override) {
  const { apiBase, languages, useApiFallback } = await getSettings();

  // Offline path. The local detector covers every layout the .NET backend
  // ships, so it should always be enough. We still keep an API fallback for
  // unforeseen issues (corrupt data.js, future languages, etc.).
  if (canHandleLanguages(languages)) {
    try {
      return detectLocal(text, languages, override ?? null);
    } catch (e) {
      if (!useApiFallback || !apiBase) return { error: String(e?.message ?? e) };
      // fall through to API
    }
  }

  if (!apiBase) {
    return { error: "Some requested languages aren't bundled offline; configure an API endpoint in Settings." };
  }

  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languages, override }),
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return res.json();
  } catch (e) {
    return { error: `API unreachable: ${e?.message ?? e}` };
  }
}

async function copyToClipboard(tabId, text) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: async (t) => { try { await navigator.clipboard.writeText(t); } catch {} },
      args: [text],
    });
  } catch { /* ignore */ }
}

async function tryToast(tabId, text, kind) {
  try { await chrome.tabs.sendMessage(tabId, { type: "SHOW_TOAST", text, kind }); }
  catch { /* content script unavailable, ignore */ }
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title,
      message,
    });
  } catch { /* notifications may not be available */ }
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
