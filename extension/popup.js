import { getSettings, isHostAllowed, isRestrictedUrl } from "./config.js";
import { bootstrap, t, availableUiLocales, getUiLocale, setUiLocale } from "./lib/i18n.js";

const input = document.getElementById("input");
const result = document.getElementById("result");
const info = document.getElementById("info");
const convertBtn = document.getElementById("convert");
const copyBtn = document.getElementById("copy");
const decryptPageBtn = document.getElementById("decrypt-page");
const undoBtn = document.getElementById("undo");
const overrideSel = document.getElementById("adapter-override");
const detectedLbl = document.getElementById("detected");
const uiLocaleSel = document.getElementById("uiLocale");

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

document.getElementById("close-panel").addEventListener("click", () => {
  window.close();
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

function setDetected(text) {
  detectedLbl.textContent = `${t("popup_detectedPrefix")}: ${text}`;
}

async function refreshDetected() {
  setDetected("…");
  const tab = await getActiveTab();
  if (!tab?.id) {
    detectedLbl.textContent = t("popup_detectedNoTab");
    return;
  }

  // chrome://, web store, etc. — Chrome blocks content scripts there entirely,
  // so REPLACE_IN_COMPOSER will always fail. Tell the user up front and steer
  // them to the textarea fallback instead of the misleading "select first" toast.
  if (isRestrictedUrl(tab.url || "")) {
    detectedLbl.textContent = t("popup_detectedRestricted");
    info.textContent = t("popup_pageNotSupported");
    decryptPageBtn.disabled = true;
    undoBtn.disabled = true;
    return;
  }

  const settings = await getSettings();
  const host = hostnameOf(tab.url || "");
  const allowed = isHostAllowed(host, settings.siteMode, settings.siteList);

  try {
    const r = await chrome.tabs.sendMessage(tab.id, { type: "GET_ADAPTER_INFO", override: overrideSel.value });
    const where = r?.hasEditable ? t("popup_detectedField", [r.editableTag]) : t("popup_detectedNoField");
    const policy = allowed ? "" : ` · ${t("popup_excludedByPolicy")}`;
    setDetected(`${r?.id ?? "?"} · ${r?.hostname ?? host} · ${where}${policy}`);
    decryptPageBtn.disabled = !allowed;
    undoBtn.disabled = !r?.canUndo;
    if (!allowed) {
      info.textContent = t("popup_excludedByPolicyExplain", [host]);
    }
  } catch {
    detectedLbl.textContent = t("popup_detectedNoContent");
    decryptPageBtn.disabled = !allowed;
    undoBtn.disabled = true;
  }
}

function populateUiLocaleSelect(active) {
  uiLocaleSel.innerHTML = "";
  for (const { code, nativeName } of availableUiLocales()) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = nativeName;
    if (code === active) opt.selected = true;
    uiLocaleSel.appendChild(opt);
  }
}

uiLocaleSel.addEventListener("change", async () => {
  await setUiLocale(uiLocaleSel.value);
  // Reapply by reopening the popup is the simplest UX. The popup is small,
  // and reload here re-runs bootstrap with the new locale.
  window.location.reload();
});

(async () => {
  await bootstrap(document);
  populateUiLocaleSelect(await getUiLocale());
  const tab = await getActiveTab();
  overrideSel.value = await readOverride(tab?.id);
  await refreshDetected();
})();

// Side panel survives tab switches (popup didn't), so re-sync the override
// dropdown and "Detected" line when the user moves to another tab.
chrome.tabs.onActivated.addListener(async () => {
  const tab = await getActiveTab();
  overrideSel.value = await readOverride(tab?.id);
  await refreshDetected();
});

overrideSel.addEventListener("change", async () => {
  const tab = await getActiveTab();
  await writeOverride(tab?.id, overrideSel.value);
  await refreshDetected();
});

decryptPageBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  if (isRestrictedUrl(tab.url || "")) {
    info.textContent = t("popup_pageNotSupported");
    input.focus();
    return;
  }
  const settings = await getSettings();
  if (!isHostAllowed(hostnameOf(tab.url || ""), settings.siteMode, settings.siteList)) {
    info.textContent = t("popup_excludedByPolicyExplain", [hostnameOf(tab.url || "")]);
    return;
  }

  decryptPageBtn.disabled = true;
  info.textContent = t("popup_decrypting");
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
      info.textContent = t("popup_resultOk", [r.adapter, r.mode, det]);
      result.textContent = r.result ?? "";
      undoBtn.disabled = !r.canUndo;
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_TOAST",
          text: t("toast_decrypted", [r.detected ? `${r.detected.from}→${r.detected.to}` : "decrypted"]),
          kind: "ok",
          result: r.result,
          copyLabel: t("popup_copy"),
          copiedLabel: t("popup_copied"),
        });
      } catch {}
    } else if (r?.reason === "already-correct") {
      info.textContent = t("popup_alreadyCorrect");
      if (r.result) result.textContent = r.result;
    } else if (r?.result) {
      try {
        await navigator.clipboard.writeText(r.result);
        info.textContent = t("popup_clipboardFallback", [r.reason ?? "?"]);
      } catch {
        info.textContent = t("popup_writeFailed", [r.reason ?? "?"]);
      }
      result.textContent = r.result;
      copyBtn.disabled = false;
    } else if (r?.reason === "empty" || r?.reason === "no-selection") {
      info.textContent = t("popup_emptyField");
    } else if (r?.reason === "composer-not-found") {
      info.textContent = t("popup_composerNotFound");
    } else if (r?.reason === "not-editable") {
      info.textContent = t("popup_notEditable");
    } else if (r?.reason === "extension-not-loaded") {
      info.textContent = t("popup_extensionNotLoaded");
    } else if (r?.error) {
      info.textContent = t("popup_genericError", [r.error]);
    } else {
      info.textContent = t("popup_couldntDecrypt", [r?.reason ?? "no response"]);
    }
  } catch (e) {
    info.textContent = t("popup_genericError", [e?.message ?? e]);
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
      info.textContent = t("popup_undone");
      try { await chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST", text: t("toast_undone"), kind: "warn" }); } catch {}
    } else {
      info.textContent = t("popup_couldntUndo", [r?.reason ?? "?"]);
      undoBtn.disabled = false;
    }
  } catch (e) {
    info.textContent = t("popup_genericError", [e?.message ?? e]);
    undoBtn.disabled = false;
  }
});

convertBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  info.textContent = t("popup_decrypting");
  result.textContent = "";
  copyBtn.disabled = true;
  try {
    const r = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text });
    if (r?.error) {
      info.textContent = t("popup_genericError", [r.error]);
      return;
    }
    if (!r.swapped) {
      info.textContent = t("popup_alreadyCorrect");
    } else {
      info.textContent = t("popup_detectionDirection", [r.detected.from, r.detected.to]);
    }
    result.textContent = r.result;
    copyBtn.disabled = false;
  } catch (e) {
    info.textContent = t("popup_genericError", [e?.message ?? e]);
  }
});

copyBtn.addEventListener("click", async () => {
  if (!result.textContent) return;
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = t("popup_copied");
  setTimeout(() => { copyBtn.textContent = t("popup_copy"); }, 1500);
});
