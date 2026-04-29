import { useState } from "react";
import { api, ConvertResponse } from "../api";
import { useSettings } from "../store";

export function ConvertPage() {
  const { settings } = useSettings();
  const [text, setText] = useState("");
  const [override, setOverride] = useState<{ from: string; to: string } | null>(null);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.convert(text, settings.languages, override ?? undefined);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.result);
  };

  const pairs: { from: string; to: string }[] = [];
  for (const a of settings.languages) {
    for (const b of settings.languages) {
      if (a !== b) pairs.push({ from: a, to: b });
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Вставь текст, набранный не на той раскладке..."
      />

      <div className="row">
        <button className="button" disabled={busy || !text.trim()} onClick={run}>
          Переключить
        </button>
        <select
          value={override ? `${override.from}->${override.to}` : "auto"}
          onChange={e => {
            const v = e.target.value;
            if (v === "auto") setOverride(null);
            else {
              const [from, to] = v.split("->");
              setOverride({ from, to });
            }
          }}
        >
          <option value="auto">Авто-детекция</option>
          {pairs.map(p => (
            <option key={`${p.from}->${p.to}`} value={`${p.from}->${p.to}`}>
              {p.from} → {p.to}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="card" style={{ borderColor: "crimson" }}>Ошибка: {error}</div>}

      {result && (
        <div className="card">
          <div className="muted">
            {result.swapped && result.detected
              ? `Обнаружено: ${result.detected.from} → ${result.detected.to}`
              : "Раскладка не менялась"}
          </div>
          <div className="result" style={{ marginTop: 8, fontSize: "1.1rem" }}>{result.result}</div>
          <div className="row">
            <button className="button ghost" onClick={copy}>Скопировать</button>
          </div>
        </div>
      )}
    </div>
  );
}
