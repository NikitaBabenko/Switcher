# Detailed description — Deutsch

Sie haben **`ghbdtn`** getippt, meinten aber **`привет`**? Drücken Sie **Ctrl+Shift+L** — und das Kauderwelsch wird zum richtigen Text. Ohne neu zu tippen, ohne das Feld zu verlassen und ohne dass auch nur ein Zeichen an einen Server geht.

## Was VibeNest Switcher anders macht

- **100% Open Source** — vollständiger Quellcode auf GitHub: https://github.com/NikitaBabenko/Switcher
- **Standardmäßig komplett offline** — keine Telemetrie, keine Analytics, keine Cloud-Anfragen; das Sprachmodell ist in die Erweiterung integriert (~270 KB)
- **Kein Konto, kein Login, keine Zahlung** — installieren und nutzen
- **12 Sprachen serienmäßig** — die meisten Alternativen decken nur ein bis zwei Sprachen ab
- **Manifest V3** — minimale Berechtigungen, bereit für die Chrome-Richtlinien 2025
- **Cross-Browser** — funktioniert in Chrome und Chromium-Forks; Edge & Firefox sind in Planung

## Vertraut für Punto-Nutzer

Wer Punto Switcher unter Windows kennt: gleiche Idee — aber im Browser, Open Source und ohne dass Text Ihr Gerät verlässt. Funktioniert in jedem Textfeld im offenen Web, nicht nur in Chatfenstern.

## Funktionen

- **Tastaturkürzel** (Ctrl+Shift+L) und Popup-Button — sofortige Korrektur des aktiven Feldes
- **„Einfügen und korrigieren"-Modus** — fehlerhaften Text ins Popup einfügen, korrigierten Text zurückbekommen
- **Rechtsklick-Kontextmenü** bei markiertem Text
- **Pro-Seite-Rückgängig** — letzte Korrektur auf der aktuellen Seite mit einem Klick zurücknehmen
- **Site-Adapter** für Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon — plus generischer Adapter für alles andere
- **Seitenrichtlinie** — bestimmte Hosts (z. B. Online-Banking) blockieren oder die Erweiterung auf eine Whitelist beschränken
- **Intelligente Sprachvorgaben** — bei Erstinstallation werden Ihre Tippsprachen aus der Browsersprache erkannt; jederzeit änderbar

## Wie es funktioniert

Der Detektor transponiert jedes Zeichen durch alle aktivierten Layout-Paare. Ein Trigramm-Sprachmodell, trainiert auf häufigen Wortlisten, bewertet beide Richtungen und wählt diejenige, die nach natürlichem Text aussieht. Caps-Lock- und Groß-/Kleinschreibungs-Heuristiken fangen Grenzfälle ab. Alles läuft in Ihrem Browser.

## Für wen

- Zweisprachig Schreibende, die mehrmals täglich zwischen Latein und einer anderen Schrift wechseln
- Übersetzer, die mitten im Absatz zwischen Quell- und Zielsprache umschalten
- Entwickler und IT-Personal in mehrsprachigen Umgebungen
- Helpdesk-Teams, die nicht an Kollegen "Уважаемые коллеги, ifkjvtt…" verschicken möchten

## Datenschutz

Standardmäßig läuft die Erweiterung ausschließlich offline. Der mitgelieferte Detektor arbeitet in Ihrem Browser; weder Text noch Metadaten werden gesendet. Berechtigungen sind minimal und in der Datenschutzerklärung begründet: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

Optional gibt es einen Remote-API-Fallback (standardmäßig aus), den Sie in den Einstellungen aktivieren können, wenn Sie Ihren eigenen Endpunkt nutzen möchten. Die Standardinstallation kontaktiert das Netzwerk nicht.

## Unterstützte Sprachen

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Eine weitere benötigt? Öffnen Sie ein Issue auf GitHub oder schreiben Sie an info@vibenest.net — ein Layout + Wortliste hinzuzufügen dauert wenige Stunden.

## Quellcode & Kontakt

- GitHub: https://github.com/NikitaBabenko/Switcher
- E-Mail für Vorschläge, Fehlerberichte und Sprachwünsche: **info@vibenest.net**

## Disclaimer

Punto Switcher ist eine Marke des jeweiligen Inhabers. VibeNest Switcher ist ein unabhängiges Open-Source-Projekt, weder mit Yandex verbunden noch von Yandex unterstützt.
