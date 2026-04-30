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
  info.textContent = "Converting...";
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
    info.textContent = `Error: ${e.message ?? e}`;
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = "Copied";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});

(async () => {
  const s = await getSettings();
  info.textContent = `Languages: ${s.languages.join(", ")}`;
})();
