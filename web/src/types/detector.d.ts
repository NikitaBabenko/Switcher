// Shim for the offline detector shared with the Chrome extension.
// Source: extension/lib/detector.js (mirrored from src/Switcher.Core/).
declare module "@switcher/detector" {
  export interface DetectedDirection {
    from: string;
    to: string;
  }
  export interface DetectorAlternative {
    text: string;
    from: string;
    to: string;
    score: number;
  }
  export interface DetectorResult {
    result: string;
    swapped: boolean;
    detected: DetectedDirection | null;
    alternatives: DetectorAlternative[];
  }

  export function detect(
    text: string,
    enabledLanguages: string[],
    override?: DetectedDirection | null,
  ): DetectorResult;

  export function canHandleLanguages(langs: string[]): boolean;
  export function availableLanguages(): string[];
  export function languageInfo(): { id: string; name: string; language: string }[];
}
