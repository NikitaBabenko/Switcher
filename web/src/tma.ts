interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  ready(): void;
  expand(): void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  MainButton?: {
    text: string;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    setText(text: string): void;
  };
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
}
