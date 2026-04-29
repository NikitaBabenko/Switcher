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
  400: "Проверь поле текста.",
  401: "Нужна авторизация Telegram.",
  413: "Текст слишком длинный (максимум 200 КБ).",
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
    throw new ApiError(0, "Нет связи с сервисом.");
  }

  if (!res.ok) {
    const friendly = FRIENDLY[res.status]
      ?? (res.status >= 500 ? "Сервис временно недоступен." : `Ошибка ${res.status}.`);
    throw new ApiError(res.status, friendly);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  convert: (text: string, languages: string[], override?: { from: string; to: string }) =>
    http<ConvertResponse>("POST", "/api/convert", { text, languages, override }),
  languages: () => http<LanguageInfo[]>("GET", "/api/languages"),
  getSettings: () => http<SettingsDto>("GET", "/api/me/settings"),
  putSettings: (s: SettingsDto) => http<SettingsDto>("PUT", "/api/me/settings", s),
};
