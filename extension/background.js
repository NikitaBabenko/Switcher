import { getSettings, isHostAllowed, isRestrictedUrl, detectDefaultLanguages, hasConfidentLanguageDetection } from "./config.js";
import { detect as detectLocal, canHandleLanguages } from "./lib/detector.js";

// Make the toolbar icon toggle the side panel. Top-level so it re-applies on
// every service-worker wakeup (setPanelBehavior is idempotent). On older Chrome
// builds without sidePanel support this just no-ops.
chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => { /* unsupported — extension still loads, panel just won't open via icon */ });

const MENU_ID = "switcher-convert-selection";
const DEFAULTS_FLAG = "__defaults_v1";

chrome.runtime.onInstalled.addListener(async (details) => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: chrome.i18n.getMessage("contextMenuTitle") || "Switcher: switch layout",
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
    if (!hasConfidentLanguageDetection(tags)) {
      // Couldn't pick ≥2 supported languages from the locale — let the user
      // choose explicitly instead of trusting our en+ru fallback silently.
      try {
        const url = chrome.runtime.getURL("options.html") + "#first-run";
        await chrome.tabs.create({ url, active: true });
      } catch { /* tabs API may not be ready in some edge cases */ }
    }
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
  if (msg?.type === "ENSURE_CONTENT_INJECTED") {
    ensureContentInjected(msg.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e?.message ?? e) }));
    return true;
  }
});

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

// Inject the on-demand content scripts into the active tab. Replaces the old
// manifest-declared content_scripts entry on <all_urls>. Each script wraps its
// body in a `__switcher_*_loaded` sentinel so re-injection on subsequent user
// actions is a no-op (no duplicate listeners, no reset of per-page undo state).
// Throws on restricted pages / lack of activeTab grant — callers wrap with try.
async function ensureContentInjected(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content/replace.js", "content/adapters.js", "content.js"],
    injectImmediately: true,
  });
}

async function convertInActiveTab(tabId, tabUrl, fallbackText) {
  // Pages where Chrome blocks content-script injection (chrome://, web store,
  // etc.) can't be edited in place. The context-menu path still works because
  // it carries selectionText and falls through to the clipboard route below,
  // so only short-circuit when we have no fallback text to convert.
  if (isRestrictedUrl(tabUrl) && !(fallbackText || "").trim()) {
    await notify(
      i18n("notification_title", null, "VibeNest Switcher"),
      i18n(
        "notification_pageNotSupported",
        null,
        "This page can't be edited by the extension. Open the side panel and paste the text into the field there.",
      ),
    );
    return;
  }

  const settings = await getSettings();
  const replaceWholeOnEmptySelection = settings.replaceWholeOnEmptySelection !== false;
  const hostname = hostnameOf(tabUrl);

  if (!isHostAllowed(hostname, settings.siteMode, settings.siteList)) {
    await notify(
      i18n("notification_title", null, "VibeNest Switcher"),
      i18n("notification_skippedPolicy", [hostname], `Skipped: ${hostname} is excluded by your site policy.`),
    );
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
    await ensureContentInjected(tabId);
    res = await chrome.tabs.sendMessage(tabId, {
      type: "REPLACE_IN_COMPOSER",
      override,
      replaceWholeOnEmptySelection,
    });
  } catch {
    res = null; // restricted page (chrome://, PDF viewer, etc.) or injection failed
  }

  if (res?.ok) {
    const det = res.detected ? `${res.detected.from}→${res.detected.to}` : "decrypted";
    await tryToast(tabId, i18n("toast_decrypted", [det], `Switcher: ${det}`), "ok");
    return;
  }

  if (res?.reason === "already-correct") {
    await tryToast(tabId, i18n("toast_alreadyCorrect", null, "Switcher: layout was already correct"), "warn");
    return;
  }

  // We have a converted result but couldn't write it back — clipboard fallback.
  if (res && res.result) {
    await copyToClipboard(tabId, res.result);
    await notify(
      i18n("notification_title", null, "VibeNest Switcher"),
      i18n("notification_copiedToClipboard", [truncate(res.result, 80)], `Copied to clipboard: ${truncate(res.result, 80)}`),
    );
    return;
  }

  // Composer not found / not editable / empty / no-selection / convert error.
  // If the user invoked from the context menu over selected text, honour that
  // text via the original GET_SELECTION → CONVERT → clipboard path.
  let textToConvert = (fallbackText || "").trim();

  if (!textToConvert) {
    try {
      await ensureContentInjected(tabId);
      const sel = await chrome.tabs.sendMessage(tabId, { type: "GET_SELECTION" });
      if (sel?.text?.trim()) textToConvert = sel.text.trim();
    } catch { /* ignore */ }
  }

  if (!textToConvert) {
    if (res?.reason === "convert-error" && res.error) {
      await notify(
        i18n("notification_title", null, "VibeNest Switcher"),
        i18n("notification_genericError", [res.error], `Error: ${res.error}`),
      );
    } else {
      await notify(
        i18n("notification_title", null, "VibeNest Switcher"),
        i18n("notification_selectFirst", null, "Select some text first, or click into a text field."),
      );
    }
    return;
  }

  const conv = await convert(textToConvert);
  if (conv?.error) {
    await notify(
      i18n("notification_title", null, "VibeNest Switcher"),
      i18n("notification_genericError", [conv.error], `Error: ${conv.error}`),
    );
    return;
  }
  if (!conv?.swapped) {
    await tryToast(tabId, i18n("toast_alreadyCorrect", null, "Switcher: layout was already correct"), "warn");
    return;
  }

  // Try in-place replacement of the selection (works on plain pages even when
  // there's no adapter match — e.g. <textarea> on a random forum).
  let replaced = false;
  try {
    await ensureContentInjected(tabId);
    const r = await chrome.tabs.sendMessage(tabId, { type: "REPLACE_SELECTION", text: conv.result });
    replaced = !!r?.ok;
  } catch {
    replaced = false;
  }

  if (replaced) {
    const det = conv.detected ? `${conv.detected.from}→${conv.detected.to}` : "decrypted";
    await tryToast(tabId, i18n("toast_decrypted", [det], `Switcher: ${det}`), "ok");
  } else {
    await copyToClipboard(tabId, conv.result);
    await notify(
      i18n("notification_title", null, "VibeNest Switcher"),
      i18n("notification_copiedToClipboard", [truncate(conv.result, 80)], `Copied to clipboard: ${truncate(conv.result, 80)}`),
    );
  }
}

// Wrapper around chrome.i18n.getMessage with a literal English fallback so
// background.js stays usable even if the locale file is missing or a key
// hasn't been added yet. Uses Chrome's UI language (not our uiLocale override);
// override applies in popup/options where users spend more time.
function i18n(key, subs, fallback) {
  try {
    const out = chrome.i18n.getMessage(key, subs ?? []);
    return out || fallback || key;
  } catch {
    return fallback || key;
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
    return {
      error: i18n(
        "convert_languagesNotBundled",
        null,
        "Some requested languages aren't bundled offline; configure an API endpoint in Settings.",
      ),
    };
  }

  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languages, override }),
    });
    if (!res.ok) return { error: i18n("convert_apiHttp", [String(res.status)], `HTTP ${res.status}`) };
    return res.json();
  } catch (e) {
    const msg = e?.message ?? String(e);
    return { error: i18n("convert_apiUnreachable", [msg], `API unreachable: ${msg}`) };
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
  try {
    await ensureContentInjected(tabId);
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_TOAST", text, kind });
  } catch { /* content script unavailable, ignore */ }
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
