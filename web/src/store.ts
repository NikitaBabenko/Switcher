import { useEffect, useState } from "react";
import { api, SettingsDto } from "./api";
import { isTma } from "./tma";

const KEY = "switcher.settings.v1";
const DEFAULT: SettingsDto = { languages: ["en", "ru"], defaultTarget: null };

function readLocal(): SettingsDto {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.languages) || parsed.languages.length === 0) return DEFAULT;
    return { languages: parsed.languages, defaultTarget: parsed.defaultTarget ?? null };
  } catch {
    return DEFAULT;
  }
}

function writeLocal(s: SettingsDto) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsDto>(readLocal());
  const [loading, setLoading] = useState(isTma());

  useEffect(() => {
    if (!isTma()) return;
    let cancelled = false;
    api.getSettings()
      .then(s => { if (!cancelled) setSettings(s); })
      .catch(() => { /* fall back to local default */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const save = async (next: SettingsDto) => {
    setSettings(next);
    if (isTma()) {
      try {
        const saved = await api.putSettings(next);
        setSettings(saved);
      } catch {
        // keep local copy on failure
      }
    } else {
      writeLocal(next);
    }
  };

  return { settings, save, loading };
}
