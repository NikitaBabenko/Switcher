import { getSettings, saveSettings, DEFAULTS } from "./config.js";
import { languageInfo } from "./lib/detector.js";

const apiBaseInput = document.getElementById("apiBase");
const useApiFallbackCb = document.getElementById("useApiFallback");
const langList = document.getElementById("langList");
const replaceWholeCb = document.getElementById("replaceWhole");
const autoCorrectCb = document.getElementById("autoCorrect");
const siteModeSel = document.getElementById("siteMode");
const siteListTa = document.getElementById("siteList");
const saveBtn = document.getElementById("save");
const savedFlag = document.getElementById("saved");

document.getElementById("open-shortcuts").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

async function load() {
  const settings = await getSettings();
  apiBaseInput.value = settings.apiBase;
  useApiFallbackCb.checked = settings.useApiFallback === true;
  replaceWholeCb.checked = settings.replaceWholeOnEmptySelection !== false;
  autoCorrectCb.checked = settings.autoCorrect === true;
  siteModeSel.value = settings.siteMode || "all";
  siteListTa.value = (settings.siteList || []).join("\n");

  // Languages come from the bundled offline detector; no network required.
  const available = languageInfo();
  const enabled = new Set(settings.languages);
  langList.innerHTML = "";
  for (const l of available) {
    const wrap = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = l.id;
    cb.checked = enabled.has(l.id);
    const span = document.createElement("span");
    span.textContent = `${l.name} (${l.id})`;
    wrap.appendChild(cb);
    wrap.appendChild(span);
    langList.appendChild(wrap);
  }
}

saveBtn.addEventListener("click", async () => {
  const apiBase = apiBaseInput.value.trim();
  const languages = Array.from(langList.querySelectorAll("input[type=checkbox]:checked")).map((c) => c.value);
  if (languages.length < 2) {
    alert("Pick at least 2 languages.");
    return;
  }
  await saveSettings({
    apiBase,
    useApiFallback: useApiFallbackCb.checked,
    languages,
    replaceWholeOnEmptySelection: replaceWholeCb.checked,
    autoCorrect: autoCorrectCb.checked,
    siteMode: siteModeSel.value,
    siteList: siteListTa.value
      .split(/\r?\n/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  });
  savedFlag.classList.add("on");
  setTimeout(() => savedFlag.classList.remove("on"), 1500);
});

load().then(maybeShowFirstRun);

function maybeShowFirstRun() {
  if (window.location.hash !== "#first-run") return;
  const banner = document.getElementById("first-run-banner");
  if (banner) banner.classList.add("on");
  // Bring the Languages section into view so the call-to-action is obvious.
  const target = document.getElementById("languages");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  // Drop the hash so a refresh doesn't keep showing the welcome banner.
  try {
    window.history.replaceState(null, "", window.location.pathname);
  } catch { /* ignore */ }
}
