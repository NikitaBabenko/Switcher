import { getSettings, saveSettings, DEFAULTS } from "./config.js";
import { languageInfo } from "./lib/detector.js";
import { bootstrap, t, availableUiLocales, getUiLocale, setUiLocale } from "./lib/i18n.js";

const apiBaseInput = document.getElementById("apiBase");
const useApiFallbackCb = document.getElementById("useApiFallback");
const langList = document.getElementById("langList");
const replaceWholeCb = document.getElementById("replaceWhole");
const autoCorrectCb = document.getElementById("autoCorrect");
const siteModeSel = document.getElementById("siteMode");
const siteListTa = document.getElementById("siteList");
const saveBtn = document.getElementById("save");
const savedFlag = document.getElementById("saved");
const uiLocaleSel = document.getElementById("uiLocale");
const shortcutHintText = document.getElementById("shortcut-hint-text");

function populateUiLocaleSelect(active) {
  uiLocaleSel.innerHTML = "";
  for (const { code, nativeName } of availableUiLocales()) {
    const opt = document.createElement("option");
    opt.value = code;
    // Show "Auto (browser language)" via the i18n key, native names verbatim
    opt.textContent = code === "auto" ? t("options_uiLanguageAuto") : nativeName;
    if (code === active) opt.selected = true;
    uiLocaleSel.appendChild(opt);
  }
}

function buildShortcutHint() {
  // Build "The keyboard shortcut is configured at <link>." with a clickable link.
  shortcutHintText.innerHTML = "";
  const template = t("options_shortcutHint");
  const [before, after] = template.split("$1");
  shortcutHintText.appendChild(document.createTextNode(before ?? ""));
  const a = document.createElement("a");
  a.href = "#";
  a.id = "open-shortcuts";
  a.textContent = "chrome://extensions/shortcuts";
  a.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });
  shortcutHintText.appendChild(a);
  shortcutHintText.appendChild(document.createTextNode(after ?? ""));
}

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
    // Layout marker like "(JCUKEN)" is hidden from the label; the source string stays in the layout JSON so we can re-enable later.
    const displayName = l.name.replace(/\s*\([^)]*\)\s*$/, "");
    span.textContent = `${displayName} (${l.id})`;
    wrap.appendChild(cb);
    wrap.appendChild(span);
    langList.appendChild(wrap);
  }
}

saveBtn.addEventListener("click", async () => {
  const apiBase = apiBaseInput.value.trim();
  const languages = Array.from(langList.querySelectorAll("input[type=checkbox]:checked")).map((c) => c.value);
  if (languages.length < 2) {
    alert(t("options_pickAtLeastTwo"));
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

uiLocaleSel.addEventListener("change", async () => {
  await setUiLocale(uiLocaleSel.value);
  // Reload reapplies bootstrap with the new locale and refreshes static labels.
  window.location.reload();
});

(async () => {
  await bootstrap(document);
  document.title = t("options_title");
  populateUiLocaleSelect(await getUiLocale());
  buildShortcutHint();
  await load();
  maybeShowFirstRun();
})();

function maybeShowFirstRun() {
  if (window.location.hash !== "#first-run") return;
  const banner = document.getElementById("first-run-banner");
  if (banner) banner.classList.add("on");
  const target = document.getElementById("languages");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    window.history.replaceState(null, "", window.location.pathname);
  } catch { /* ignore */ }
}
