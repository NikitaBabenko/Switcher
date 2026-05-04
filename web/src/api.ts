import { getTma } from "./tma";

export interface LanguageInfo {
  id: string;
  name: string;
  language: string;
}

export interface ConvertResponse {
  result: string;
  swapped: boolean;
  detected: { from: string; to: string } | null;
  alternatives: { text: string; from: string; to: string; score: number }[];
}

export interface SettingsDto {
  languages: string[];
  defaultTarget: string | null;
}

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

function headers(): HeadersInit {
  const tma = getTma();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (tma?.initData) h["X-Tg-InitData"] = tma.initData;
  return h;
}

const FRIENDLY: Record<number, string> = {
  400: "Check the text field.",
  401: "Telegram authorization required.",
  413: "Text is too long (max 200 KB).",
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the service.");
  }

  if (!res.ok) {
    const friendly = FRIENDLY[res.status]
      ?? (res.status >= 500 ? "Service is temporarily unavailable." : `Error ${res.status}.`);
    throw new ApiError(res.status, friendly);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Lazy import the offline detector so its ~270 KB of trigram data lands in a
// separate chunk and doesn't weigh on the first paint.
let detectorPromise: Promise<typeof import("@switcher/detector")> | null = null;
function loadDetector() {
  if (!detectorPromise) detectorPromise = import("@switcher/detector");
  return detectorPromise;
}

async function convertOffline(
  text: string,
  languages: string[],
  override?: { from: string; to: string },
): Promise<ConvertResponse | null> {
  const d = await loadDetector();
  if (!d.canHandleLanguages(languages)) return null;
  const r = d.detect(text, languages, override ?? null);
  return {
    result: r.result,
    swapped: r.swapped,
    detected: r.detected,
    alternatives: r.alternatives,
  };
}

export const api = {
  // Conversion runs entirely in the browser via the bundled offline detector.
  // Falls back to the REST endpoint only if a requested language isn't covered
  // by the bundled models — in practice this never happens because the bundle
  // ships every language the backend supports.
  convert: async (
    text: string,
    languages: string[],
    override?: { from: string; to: string },
  ): Promise<ConvertResponse> => {
    const offline = await convertOffline(text, languages, override);
    if (offline) return offline;
    return http<ConvertResponse>("POST", "/api/convert", { text, languages, override });
  },
  // Languages come from the bundled detector — no network round-trip.
  languages: async (): Promise<LanguageInfo[]> => {
    const d = await loadDetector();
    return d.languageInfo();
  },
  getSettings: () => http<SettingsDto>("GET", "/api/me/settings"),
  putSettings: (s: SettingsDto) => http<SettingsDto>("PUT", "/api/me/settings", s),
};
