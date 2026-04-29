interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface MainButton {
  text: string;
  isVisible: boolean;
  isActive: boolean;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  setText(text: string): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface HapticFeedback {
  notificationOccurred(type: "error" | "success" | "warning"): void;
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
  selectionChanged(): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  ready(): void;
  expand(): void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string | undefined>;
  MainButton?: MainButton;
  HapticFeedback?: HapticFeedback;
  onEvent(event: "themeChanged" | string, cb: () => void): void;
  offEvent(event: "themeChanged" | string, cb: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTma(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function isTma(): boolean {
  const tma = getTma();
  return !!tma && !!tma.initData;
}

export function initTma() {
  const tma = getTma();
  if (!tma) return;
  tma.ready();
  tma.expand();
  applyTelegramTheme();
  tma.onEvent("themeChanged", applyTelegramTheme);
}

const VAR_MAP: Record<string, string> = {
  bg_color: "--bg",
  text_color: "--fg",
  hint_color: "--muted",
  link_color: "--accent",
  button_color: "--accent",
  button_text_color: "--accent-fg",
  secondary_bg_color: "--card",
  section_separator_color: "--border",
};

export function applyTelegramTheme() {
  const tma = getTma();
  if (!tma) return;
  const root = document.documentElement.style;
  for (const [tg, css] of Object.entries(VAR_MAP)) {
    const value = tma.themeParams[tg];
    if (value) root.setProperty(css, value);
  }
}
