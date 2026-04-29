import { getSettings } from "./config.js";

const MENU_ID = "switcher-convert-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Switcher: переключить раскладку",
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
  let selection = fallbackText;
  try {
    const r = await chrome.tabs.sendMessage(tabId, { type: "GET_SELECTION" });
    if (r?.text) selection = r.text;
  } catch {
    // content script not loaded (e.g. chrome:// page) — use fallback
  }

  if (!selection?.trim()) {
    await notify("VibeNest Switcher", "Сначала выдели текст.");
    return;
  }

  const r = await convert(selection);
  if (r.error) {
    await notify("VibeNest Switcher", `Ошибка: ${r.error}`);
    return;
  }
  if (!r.swapped) {
    await notify("VibeNest Switcher", "Раскладка уже верная.");
    return;
  }

  let replaced = false;
  try {
    const resp = await chrome.tabs.sendMessage(tabId, { type: "REPLACE_SELECTION", text: r.result });
    replaced = !!resp?.ok;
  } catch {
    replaced = false;
  }

  if (!replaced) {
    await copyToClipboard(tabId, r.result);
    await notify("VibeNest Switcher", `Скопировано в буфер: ${truncate(r.result, 80)}`);
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
