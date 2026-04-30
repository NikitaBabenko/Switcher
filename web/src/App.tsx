import { useState } from "react";
import { ConvertPage } from "./pages/ConvertPage";
import { SettingsPage } from "./pages/SettingsPage";

type Tab = "convert" | "settings";

export function App() {
  const [tab, setTab] = useState<Tab>("convert");
  return (
    <>
      <header className="banner">
        <div className="banner-inner">
          <span className="brand">VibeNest Switcher</span>
          <span className="banner-links">
            <a href="https://vibenest.net" target="_blank" rel="noreferrer">vibenest.net</a>
            <span aria-hidden="true"> · </span>
            <a href="https://t.me/SynthCabalBot" target="_blank" rel="noreferrer">@SynthCabalBot</a>
          </span>
        </div>
      </header>
      <div className="app">
        <div className="tabs">
          <button className={`tab ${tab === "convert" ? "active" : ""}`} onClick={() => setTab("convert")}>
            Convert
          </button>
          <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
            Languages
          </button>
        </div>
        {tab === "convert" ? <ConvertPage /> : <SettingsPage />}
      </div>
    </>
  );
}
