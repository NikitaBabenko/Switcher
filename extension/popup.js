import { getSettings } from "./config.js";

const input = document.getElementById("input");
const result = document.getElementById("result");
const info = document.getElementById("info");
const convertBtn = document.getElementById("convert");
const copyBtn = document.getElementById("copy");

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

convertBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  info.textContent = "Конвертация...";
  result.textContent = "";
  copyBtn.disabled = true;
  try {
    const r = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text });
    if (r?.error) {
      info.textContent = `Ошибка: ${r.error}`;
      return;
    }
    if (!r.swapped) {
      info.textContent = "Раскладка уже верная.";
    } else {
      info.textContent = `Обнаружено: ${r.detected.from} → ${r.detected.to}`;
    }
    result.textContent = r.result;
    copyBtn.disabled = false;
  } catch (e) {
    info.textContent = `Ошибка: ${e.message ?? e}`;
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = "Скопировано";
  setTimeout(() => (copyBtn.textContent = "Скопировать"), 1500);
});

(async () => {
  const s = await getSettings();
  info.textContent = `Языки: ${s.languages.join(", ")}`;
})();
