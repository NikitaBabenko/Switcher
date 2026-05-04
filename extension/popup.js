import { getSettings } from "./config.js";

const input = document.getElementById("input");
const result = document.getElementById("result");
const info = document.getElementById("info");
const convertBtn = document.getElementById("convert");
const copyBtn = document.getElementById("copy");
const decryptPageBtn = document.getElementById("decrypt-page");
const overrideSel = document.getElementById("adapter-override");
const detectedLbl = document.getElementById("detected");

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
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

async function refreshDetected() {
  detectedLbl.textContent = "Detected: …";
  const tabId = await getActiveTabId();
  if (!tabId) { detectedLbl.textContent = "Detected: (no tab)"; return; }
  try {
    const r = await chrome.tabs.sendMessage(tabId, { type: "GET_ADAPTER_INFO", override: overrideSel.value });
    const where = r?.hasEditable ? `field: <${r.editableTag}>` : "no focused field";
    detectedLbl.textContent = `Detected: ${r?.id ?? "?"} · ${r?.hostname ?? ""} · ${where}`;
  } catch {
    detectedLbl.textContent = "Detected: (content script unavailable on this page)";
  }
}

(async () => {
  const tabId = await getActiveTabId();
  overrideSel.value = await readOverride(tabId);
  await refreshDetected();
})();

overrideSel.addEventListener("change", async () => {
  const tabId = await getActiveTabId();
  await writeOverride(tabId, overrideSel.value);
  await refreshDetected();
});

decryptPageBtn.addEventListener("click", async () => {
  const tabId = await getActiveTabId();
  if (!tabId) return;
  decryptPageBtn.disabled = true;
  info.textContent = "Decrypting…";
  result.textContent = "";
  copyBtn.disabled = true;
  try {
    const settings = await getSettings();
    const r = await chrome.tabs.sendMessage(tabId, {
      type: "REPLACE_IN_COMPOSER",
      override: overrideSel.value,
      replaceWholeOnEmptySelection: settings.replaceWholeOnEmptySelection !== false,
    });
    if (r?.ok) {
      const det = r.detected ? ` · ${r.detected.from}→${r.detected.to}` : "";
      info.textContent = `OK [${r.adapter}/${r.mode}]${det}`;
      result.textContent = r.result ?? "";
    } else if (r?.reason === "already-correct") {
      info.textContent = "Layout was already correct.";
      if (r.result) result.textContent = r.result;
    } else if (r?.result) {
      // We have a converted result but the adapter couldn't write it back.
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
