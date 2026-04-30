import { useEffect, useState } from "react";
import { api, LanguageInfo } from "../api";
import { useSettings } from "../store";

export function SettingsPage() {
  const { settings, save, loading } = useSettings();
  const [available, setAvailable] = useState<LanguageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.languages()
      .then(setAvailable)
      .catch(e => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const toggle = (id: string) => {
    const set = new Set(settings.languages);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    save({ ...settings, languages: [...set] });
  };

  const setTarget = (id: string | null) => {
    save({ ...settings, defaultTarget: id });
  };

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div>
      <p className="muted">Pick the languages to switch between. At least 2.</p>
      {error && <div className="card" style={{ borderColor: "crimson" }}>{error}</div>}
      <div className="lang-list">
        {available.map(l => (
          <label key={l.id}>
            <input
              type="checkbox"
              checked={settings.languages.includes(l.id)}
              onChange={() => toggle(l.id)}
            />
            <span>{l.name} <span className="muted">({l.id})</span></span>
          </label>
        ))}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <span className="muted">Default target layout:</span>
        <select
          value={settings.defaultTarget ?? ""}
          onChange={e => setTarget(e.target.value || null)}
        >
          <option value="">— auto —</option>
          {settings.languages.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
