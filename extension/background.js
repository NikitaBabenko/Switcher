import { getSettings } from "./config.js";

const MENU_ID = "switcher-convert-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Switcher: switch layout",
    contexts: ["selection", "editable"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  await convertInActiveTab(tab.id, info.selectionText ?? "");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "convert-selection") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await convertInActiveTab(tab.id, "");
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "CONVERT_TEXT") {
    convert(msg.text, msg.override).then(sendResponse).catch((e) => sendResponse({ error: String(e) }));
    return true;
  }
});

async function convertInActiveTab(tabId, fallbackText) {
  const settings = await getSettings();
  const replaceWholeOnEmptySelection = settings.replaceWholeOnEmptySelection !== false;

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
    return; // success; no notification — feedback is the visible text change
  }

  if (res?.reason === "already-correct") {
    await notify("VibeNest Switcher", "Layout was already correct.");
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
    await notify("VibeNest Switcher", "Layout was already correct.");
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

  if (!replaced) {
    await copyToClipboard(tabId, conv.result);
    await notify("VibeNest Switcher", `Copied to clipboard: ${truncate(conv.result, 80)}`);
  }
}

async function convert(text, override) {
  const { apiBase, languages } = await getSettings();
  const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, languages, override }),
  });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  return res.json();
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
