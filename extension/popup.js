import { getSettings, isHostAllowed } from "./config.js";

const input = document.getElementById("input");
const result = document.getElementById("result");
const info = document.getElementById("info");
const convertBtn = document.getElementById("convert");
const copyBtn = document.getElementById("copy");
const decryptPageBtn = document.getElementById("decrypt-page");
const undoBtn = document.getElementById("undo");
const overrideSel = document.getElementById("adapter-override");
const detectedLbl = document.getElementById("detected");

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

async function readOverride(tabId) {
  if (!tabId || !chrome.storage?.session) return "auto";
  try {
    const stored = await chrome.storage.session.get([`override_${tabId}`]);
    return stored[`override_${tabId}`] ?? "auto";
  } catch { return "auto"; }
}

async function writeOverride(tabId, value) {
  if (!tabId || !chrome.storage?.session) return;
  try { await chrome.storage.session.set({ [`override_${tabId}`]: value }); } catch {}
}

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

async function refreshDetected() {
  detectedLbl.textContent = "Detected: …";
  const tab = await getActiveTab();
  if (!tab?.id) { detectedLbl.textContent = "Detected: (no tab)"; return; }

  const settings = await getSettings();
  const host = hostnameOf(tab.url || "");
  const allowed = isHostAllowed(host, settings.siteMode, settings.siteList);

  try {
    const r = await chrome.tabs.sendMessage(tab.id, { type: "GET_ADAPTER_INFO", override: overrideSel.value });
    const where = r?.hasEditable ? `field: <${r.editableTag}>` : "no focused field";
    const policy = allowed ? "" : " · excluded by policy";
    detectedLbl.textContent = `Detected: ${r?.id ?? "?"} · ${r?.hostname ?? host} · ${where}${policy}`;
    decryptPageBtn.disabled = !allowed;
    undoBtn.disabled = !r?.canUndo;
    if (!allowed) {
      info.textContent = `${host} is excluded by your site policy. Edit the list in Settings.`;
    }
  } catch {
    detectedLbl.textContent = "Detected: (content script unavailable on this page)";
    decryptPageBtn.disabled = !allowed;
    undoBtn.disabled = true;
  }
}

(async () => {
  const tab = await getActiveTab();
  overrideSel.value = await readOverride(tab?.id);
  await refreshDetected();
})();

overrideSel.addEventListener("change", async () => {
  const tab = await getActiveTab();
  await writeOverride(tab?.id, overrideSel.value);
  await refreshDetected();
});

decryptPageBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  const settings = await getSettings();
  if (!isHostAllowed(hostnameOf(tab.url || ""), settings.siteMode, settings.siteList)) {
    info.textContent = "This site is excluded by your policy.";
    return;
  }

  decryptPageBtn.disabled = true;
  info.textContent = "Decrypting…";
  result.textContent = "";
  copyBtn.disabled = true;
  try {
    const r = await chrome.tabs.sendMessage(tab.id, {
      type: "REPLACE_IN_COMPOSER",
      override: overrideSel.value,
      replaceWholeOnEmptySelection: settings.replaceWholeOnEmptySelection !== false,
    });
    if (r?.ok) {
      const det = r.detected ? ` · ${r.detected.from}→${r.detected.to}` : "";
      info.textContent = `OK [${r.adapter}/${r.mode}]${det}`;
      result.textContent = r.result ?? "";
      undoBtn.disabled = !r.canUndo;
      try { await chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST", text: `Switcher: decrypted${det}`, kind: "ok" }); } catch {}
    } else if (r?.reason === "already-correct") {
      info.textContent = "Layout was already correct.";
      if (r.result) result.textContent = r.result;
    } else if (r?.result) {
      try {
        await navigator.clipboard.writeText(r.result);
        info.textContent = `Copied to clipboard (couldn't write into composer: ${r.reason ?? "?"}).`;
      } catch {
        info.textContent = `Couldn't write into composer: ${r.reason ?? "?"}.`;
      }
      result.textContent = r.result;
      copyBtn.disabled = false;
    } else if (r?.reason === "empty" || r?.reason === "no-selection") {
      info.textContent = "No text in the focused field.";
    } else if (r?.reason === "composer-not-found") {
      info.textContent = "Couldn't find a text field on this page. Click into one and try again.";
    } else if (r?.reason === "not-editable") {
      info.textContent = "Focused element is not a text field.";
    } else if (r?.reason === "extension-not-loaded") {
      info.textContent = "Reload this page so the extension can attach.";
    } else if (r?.error) {
      info.textContent = `Error: ${r.error}`;
    } else {
      info.textContent = `Couldn't decrypt: ${r?.reason ?? "no response"}.`;
    }
  } catch (e) {
    info.textContent = `Error: ${e?.message ?? e}`;
  } finally {
    decryptPageBtn.disabled = false;
  }
});

undoBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  undoBtn.disabled = true;
  try {
    const r = await chrome.tabs.sendMessage(tab.id, { type: "UNDO_REPLACE" });
    if (r?.ok) {
      info.textContent = "Undone.";
      try { await chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST", text: "Switcher: undone", kind: "warn" }); } catch {}
    } else {
      info.textContent = `Couldn't undo: ${r?.reason ?? "?"}.`;
      undoBtn.disabled = false;
    }
  } catch (e) {
    info.textContent = `Error: ${e?.message ?? e}`;
    undoBtn.disabled = false;
  }
});

convertBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  info.textContent = "Decrypting…";
  result.textContent = "";
  copyBtn.disabled = true;
  try {
    const r = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text });
    if (r?.error) {
      info.textContent = `Error: ${r.error}`;
      return;
    }
    if (!r.swapped) {
      info.textContent = "Layout was already correct.";
    } else {
      info.textContent = `Detected: ${r.detected.from} → ${r.detected.to}`;
    }
    result.textContent = r.result;
    copyBtn.disabled = false;
  } catch (e) {
    info.textContent = `Error: ${e?.message ?? e}`;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!result.textContent) return;
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = "Copied";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});
