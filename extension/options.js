import { getSettings, saveSettings, DEFAULTS } from "./config.js";

const apiBaseInput = document.getElementById("apiBase");
const langList = document.getElementById("langList");
const saveBtn = document.getElementById("save");
const savedFlag = document.getElementById("saved");

document.getElementById("open-shortcuts").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

async function load() {
  const settings = await getSettings();
  apiBaseInput.value = settings.apiBase;

  let available;
  try {
    const res = await fetch(`${settings.apiBase.replace(/\/+$/, "")}/api/languages`);
    available = await res.json();
  } catch {
    available = (settings.languages.length ? settings.languages : DEFAULTS.languages)
      .map((id) => ({ id, name: id, language: id }));
  }

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
  const apiBase = apiBaseInput.value.trim() || DEFAULTS.apiBase;
  const languages = Array.from(langList.querySelectorAll("input[type=checkbox]:checked")).map((c) => c.value);
  if (languages.length < 2) {
    alert("Выбери хотя бы 2 языка.");
    return;
  }
  await saveSettings({ apiBase, languages });
  savedFlag.classList.add("on");
  setTimeout(() => savedFlag.classList.remove("on"), 1500);
});

load();
