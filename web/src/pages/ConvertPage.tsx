import { useEffect, useRef, useState } from "react";
import { api, ConvertResponse } from "../api";
import { useSettings } from "../store";
import { getTma, isTma } from "../tma";

export function ConvertPage() {
  const { settings } = useSettings();
  const [text, setText] = useState("");
  const [override, setOverride] = useState<{ from: string; to: string } | null>(null);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Latest values for the closure that lives behind Telegram's MainButton handler.
  const latest = useRef({ text, settings, override, busy });
  latest.current = { text, settings, override, busy };

  const run = async () => {
    const { text: t, settings: s, override: ov, busy: b } = latest.current;
    if (b || !t.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.convert(t, s.languages, ov ?? undefined);
      setResult(r);
      const haptic = getTma()?.HapticFeedback;
      haptic?.notificationOccurred(r.swapped ? "success" : "warning");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      getTma()?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setBusy(false);
    }
  };

  // TMA: drive the native MainButton instead of the React button.
  const inTma = isTma();
  useEffect(() => {
    if (!inTma) return;
    const mb = getTma()?.MainButton;
    if (!mb) return;
    mb.setText("Switch");
    mb.show();
    const handler = () => run();
    mb.onClick(handler);
    return () => {
      mb.offClick(handler);
      mb.hide();
    };
  }, [inTma]);

  useEffect(() => {
    const mb = getTma()?.MainButton;
    if (!mb) return;
    if (text.trim() && !busy) mb.enable(); else mb.disable();
  }, [text, busy]);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.result);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
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
        onKeyDown={onKey}
        placeholder="Paste text typed in the wrong layout... (Ctrl/Cmd+Enter to switch)"
      />

      <div className="row">
        {!inTma && (
          <button className="button" disabled={busy || !text.trim()} onClick={run}>
            Switch
          </button>
        )}
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
          <option value="auto">Auto-detect</option>
          {pairs.map(p => (
            <option key={`${p.from}->${p.to}`} value={`${p.from}->${p.to}`}>
              {p.from} → {p.to}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="card" style={{ borderColor: "crimson" }}>{error}</div>}

      {result && (
        <div className="card">
          <div className="muted">
            {result.swapped && result.detected
              ? `Detected: ${result.detected.from} → ${result.detected.to}`
              : "Layout was already correct"}
          </div>
          <div className="result" style={{ marginTop: 8, fontSize: "1.1rem" }}>{result.result}</div>
          <div className="row">
            <button className="button ghost" onClick={copy}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}
