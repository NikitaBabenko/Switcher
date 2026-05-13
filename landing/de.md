---
title: "Tastatur-Layout-Korrektor: falsche Tastatur in 12 Sprachen reparieren"
description: "Chrome-Erweiterung, die Text in falschem Tastaturlayout per Tastenkombination korrigiert. 12 Layouts (Russisch, Deutsch, Französisch und mehr), offline, Open Source."
slug: switcher
locale: de
hreflang:
  en: /switcher
  ru: /ru/switcher
  uk: /uk/switcher
  be: /be/switcher
  de: /de/switcher
  fr: /fr/switcher
  el: /el/switcher
  he: /he/switcher
  tr: /tr/switcher
  pl: /pl/switcher
  es: /es/switcher
  ko: /ko/switcher
canonical: https://vibenest.net/de/switcher
og_image: /og/switcher-de.png
schema:
  - SoftwareApplication
  - FAQPage
  - BreadcrumbList
keywords_primary: tastatur layout
keywords_secondary:
  - falsches tastaturlayout
  - tastatur layout ändern
  - russische tastatur chrome
  - kyrillische tastatur online
last_updated: 2026-05-13
---

<!-- TODO: Web Store ID - `vibenest-switcher` in den CTAs nach Veröffentlichung ersetzen. -->

# Tastatur-Layout-Korrektor: falsche Tastatur in 12 Sprachen reparieren

Sie haben `ghbdtn` getippt und `привет` gemeint. **VibeNest Switcher** ist eine Chrome-Erweiterung, die Text aus einem falschen Tastaturlayout in einer einzigen Tastenkombination korrekt zurückschreibt. Kein Markieren, kein Kopieren, kein Neutippen. Die Erkennung läuft offline, der Quellcode liegt auf GitHub, und im Lieferumfang sind 12 Tastatur-Layouts (Englisch, Russisch, Deutsch, Französisch, Polnisch, Spanisch, Koreanisch und sechs weitere).

[**Aus dem Chrome Web Store installieren →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

> **Open Source · Offline · 12 Tastatur-Layouts · Manifest V3 · Keine Telemetrie · Kein Konto · Kostenlos**

## Falsches Tastaturlayout in einer Sekunde reparieren

Wer täglich zwischen Latein und Kyrillisch wechselt (oder zwischen Deutsch, Französisch und Englisch über dieselbe Tastatur), kennt den Moment: Sie haben in der falschen Eingabesprache geschrieben, der Satz steht falsch da, und der System-Layout-Wechsel hilft nur beim *nächsten* Buchstaben, nicht beim bereits Eingetippten. VibeNest Switcher ist genau der fehlende Knopf: Cursor in das Textfeld, **`Strg+Umschalt+L`**, und das Feld wird an Ort und Stelle neu geschrieben. Funktioniert in jedem Eingabefeld im offenen Web: Twitter/X, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, LinkedIn, Reddit.

### Vorher / Nachher

| Sie haben getippt (falsches Layout) | Was Sie eigentlich meinten |
|---|---|
| `ghbdtn` | `привет` |
| `Руддщ` | `Hello` |
| `Hallo Welt` (in Russisch eingegeben) | `Руддщ Цудш` |
| `Lf, ds nfv;t!` | `Да, вы там же!` |
| `xfq c kbvjyjv` | `чай с лимоном` |

Dieselbe Tastenkombination wirkt in alle Richtungen zwischen den 12 unterstützten Tastatur-Layouts. Sie können den verstümmelten Text auch in das Toolbar-Popup einfügen und die korrigierte Version mit einem Klick kopieren.

## Das Wrong-Layout-Problem, über das niemand spricht

Russlanddeutsche, deutsch-französische Übersetzer, IT-Fachkräfte in internationalen Teams, Helpdesk-Kollegen, Sprachstudenten: alle, die täglich in zwei Schriftsystemen schreiben, kennen den Rhythmus. Layout vergessen, Bildschirm angeschaut, Text markieren, löschen, neu tippen. Fünf Sekunden, dutzendfach pro Tag, ein paar Tage pro Jahr verloren an eine schlechte Gewohnheit zwischen Hand und Betriebssystem.

Der System-Layout-Wechsel löst das nicht. Er schaltet nur die aktive Eingabesprache um, repariert aber nicht das, was schon auf dem Bildschirm steht. Phonetische Transliteratoren (Translit, Cyrillatin) lösen das auch nicht. Sie helfen, ohne kyrillische Tastatur Russisch zu tippen, indem man `privet` für `привет` schreibt. Das ist eine andere Aufgabe. **VibeNest Switcher behebt genau diesen Moment**: Sie haben fertig geschrieben, gesehen, dass das Layout falsch war, und wollen das Ergebnis an Ort und Stelle reparieren, ohne aus dem Feld zu gehen.

Die klassische Antwort auf dem Desktop war eine kleine Familie von Layout-Switcher-Utilities. Alle Closed-Source, alle Windows-only und nicht in der Lage, in die modernen Web-Apps zu greifen, in denen das meiste Tippen heute stattfindet. VibeNest Switcher ist die Open-Source-, Browser-native, vollständig offline arbeitende Alternative: läuft im Eingabefeld dort, wo Sie tatsächlich tippen, auf jedem Betriebssystem, das Chrome unterstützt.

## Funktionen

- **Tastenkombination** (`Strg+Umschalt+L`) und Popup-Knopf in der Toolbar: sofortige Korrektur des aktiven Eingabefeldes
- **Einfügen-und-Korrigieren-Modus**: verstümmelten Text in das Popup einfügen, korrigierte Version sehen, mit einem Klick herauskopieren
- **Rechtsklick-Kontextmenü** auf markierten Text, ohne die Hand von der Maus zu nehmen
- **Auto-Korrektur beim Tippen**: optional, standardmäßig aus; Rücktaste verwirft jede Auto-Korrektur
- **Pro-Seite-Rückgängig**: macht die letzte Korrektur auf der aktuellen Seite mit einem Klick rückgängig
- **Site-Adapter** für Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon plus generischer Adapter für alles andere
- **Site-Richtlinien**: bestimmte Hosts blockieren (Bank, Intranet) oder die Erweiterung auf eine Whitelist beschränken
- **Smarte Sprach-Defaults**: bei der ersten Installation liest die Erweiterung die Browser-Locale und wählt die wahrscheinlichsten Tippsprachen vor; jederzeit in den Optionen änderbar
- **12 Tastatur-Layouts ab Werk**: Englisch (US-QWERTY), Russisch (ЙЦУКЕН), Ukrainisch, Belarussisch, Deutsch (QWERTZ), Französisch (AZERTY), Griechisch, Hebräisch, Türkisch (Q), Polnisch (214), Spanisch (QWERTY), Koreanisch (Dubeolsik). Koreanisch ist ein Sonderfall: die Engine zerlegt Hangul-Silben in Jamo, transponiert und setzt sie wieder zusammen
- **12 UI-Übersetzungen** für Popup und Optionen: en, ru, uk, be, de, fr, el, he, tr, pl, es, ko

Manifest V3, geprüfte Minimal-Berechtigungen, kompatibel mit der Chrome-Policy 2025 ohne Migrationsaufwand auf Ihrer Seite.

## Wie es funktioniert

Der Detektor transponiert jedes Zeichen durch jedes aktivierte Layout-Paar, dann bewertet ein Zeichen-Trigramm-Modell, trainiert auf den Top-3000-Wörtern jeder Sprache, beide Richtungen und behält die, die wie natürlicher Text aussieht. Eine Caps-Lock-Heuristik und ein "Großschreibungs-Natürlichkeits"-Tiebreaker fangen die Randfälle ab (`hELLO` wird zu `Hello`, absichtliches CAPS LOCK bleibt unangetastet). Das alles läuft im Browser: nichts geht an ein entferntes Modell, kein API-Aufruf, keine Netzwerk-Latenz in der Schleife.

Der Algorithmus arbeitet **ohne LLM**. Es ist eine Transpositionstabelle plus ein kleiner statistischer Scorer. Damit wiegt das eingebaute Sprachmodell rund 270 KB, und die Konvertierung läuft im Sub-Millisekundenbereich, genau das Profil, das man für Inline-Einsatz in beliebigen Eingabefeldern braucht. Weil das Modell mitgeliefert und eingefroren ist, verhält sich jede Installation gleich. Kein stilles Nachtrainieren auf einem Server hinter Ihrem Rücken.

## Wie VibeNest Switcher im Vergleich abschneidet

Die Kategorie "mehrsprachiger Tastatur-Layout-Korrektor" ist eng begrenzt. Die ernstzunehmenden Alternativen unterscheiden sich auf wenigen Achsen, die für die meisten Nutzer wichtig sind: Lässt sich der Quellcode prüfen, was verlässt das Gerät, wie viele Layouts werden ab Werk unterstützt, und läuft das Tool im Browser oder nur auf dem Desktop.

| | **VibeNest Switcher** | EasyType Switcher | Caramba Switcher | Punto Switcher |
|---|---|---|---|---|
| Open Source (prüfbar) | Ja, MIT, Code auf GitHub | Nein | Nein | Nein |
| Vollständig offline / keine Telemetrie | Ja, eingebautes Modell, kein Netz | Geschlossener Quellcode, nicht prüfbar | Desktop | Desktop |
| Anzahl Tastatur-Layouts | **12** | 2 (RU/EN) | 2-3 | 2 (RU/EN) |
| Manifest V3 / Browser-nativ | Ja, MV3, Policy-2025-fertig | Ja, MV3 | Nein, nur Desktop | Nein, nur Desktop |
| Plattformübergreifend | Ja, jedes OS mit Chrome / Chromium | Ja, jedes OS mit Chrome | Nein, nur Windows | Nein, nur Windows |
| Auto-Korrektur beim Tippen | Ja, optional, Passwort-sicher | Ja | Ja | Ja |
| Aktiv gepflegt (2026) | Ja, offener Issue-Tracker | Sporadisch | Ja | Ja |

VibeNest Switcher ist die einzige Zeile, in der gleichzeitig Open Source, Browser-nativ und voll offline steht. Wer das Gefühl eines Desktop-Layout-Switchers im Browser haben möchte, ohne geschlossene Binärdatei und ohne dass Text das Gerät verlässt, findet hier die passende Nische.

[**Aus dem Chrome Web Store installieren →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

## Häufig gestellte Fragen

### Wie repariere ich Text, den ich im falschen Tastaturlayout eingetippt habe?

VibeNest Switcher installieren, Cursor in das Textfeld mit dem verstümmelten Text setzen und **`Strg+Umschalt+L`** drücken. Die Erweiterung erkennt, in welchem Layout-Paar der Text geschrieben wurde, transponiert die Zeichen und schreibt das Feld an Ort und Stelle neu. Sie müssen nichts markieren, kopieren oder neu tippen. Dieselbe Tastenkombination wirkt in Twitter, Slack, Telegram Web, WhatsApp Web, Discord, Gmail, Notion, Reddit, LinkedIn und jedem anderen Eingabefeld im offenen Web. Lässt sich ein Feld nicht direkt bearbeiten (zum Beispiel ein schreibgeschützter Export-View), kopiert die Erweiterung den korrigierten Text in die Zwischenablage und zeigt eine kleine Benachrichtigung.

### Wie ändere ich das Tastaturlayout direkt im Browser?

VibeNest Switcher ersetzt nicht den System-Layout-Wechsel. Zum Umschalten der aktiven Eingabesprache verwenden Sie weiterhin Ihre gewohnte System-Kombination. Die Erweiterung ist für etwas anderes da: bereits eingetippten Text zu reparieren. Haben Sie auf Englisch angefangen, während das System auf Russisch stand (also `Руддщ` statt `Hello`), schreibt eine Tastenkombination das Feld neu. In die andere Richtung genauso: `ghbdtn` wird in Millisekunden zu `привет`, ohne zusätzliche Klicks und ohne das Feld zu verlassen.

### Funktioniert es auch mit der russischen Tastatur unter Windows oder Linux?

Ja, mit jedem Betriebssystem, auf dem Chrome oder ein Chromium-Browser läuft (Windows, macOS, Linux, ChromeOS). Die Erweiterung hängt nicht an einer bestimmten System-Tastaturkonfiguration. Sie braucht nur, dass Ihre russische, deutsche oder englische Tastatur in Ihrem Betriebssystem als Eingabesprache aktiv ist. Was VibeNest reparieren kann, ist alles, was in einem Web-Eingabefeld landet, egal über welche Hardware-Tastatur oder Sprach-Einstellung.

### Wie unterscheidet es sich von Punto Switcher?

Das ist eine Desktop-Anwendung für Windows. VibeNest Switcher ist die unabhängige Open-Source-Alternative, die komplett innerhalb von Chrome und jedem Chromium-Browser läuft, also auf macOS, Linux, ChromeOS und Windows gleich gut. Und sie wirkt in den Web-Feldern, in denen das meiste moderne Tippen passiert. Die Idee der Erkennung ist dieselbe (transponieren, dann bewerten), aber das Modell ist in die Erweiterung eingebaut und arbeitet offline. Kein Zeichen Ihres Textes verlässt den Browser. Der Quellcode liegt auf [GitHub](https://github.com/NikitaBabenko/Switcher), die Datenschutz-Behauptung ist über die Quellen prüfbar statt nur ein Versprechen.

### Transliteriert es Kyrillisch zu Latein (oder umgekehrt)?

Nein. Das hier ist Layout-Reparatur, keine phonetische Eingabe. Wer Russisch auf einer reinen US-Tastatur tippen will, indem er Wörter phonetisch buchstabiert (`privet` für `привет`, `spasibo` für `спасибо`), braucht einen phonetischen Transliterator (Cyrillatin, Translit). VibeNest Switcher ist für den Fall, dass beide Layouts schon da sind, das falsche aktiv war, und das Ergebnis in einem Schritt repariert werden soll. Beide Kategorien lösen benachbarte Probleme, sind aber nicht austauschbar.

### Arbeitet es offline? Was verlässt meinen Browser?

Standardmäßig vollständig offline. Das mitgelieferte Trigramm-Sprachmodell wohnt im Erweiterungspaket; die Erkennung läuft auf Ihrem Gerät. **Weder Text noch Metadaten werden irgendwohin geschickt.** Kein Analytics-SDK, keine Telemetrie, kein Remote-Logging, kein Drittanbieter-Skript. In den Optionen gibt es einen optionalen Remote-API-Fallback, der **standardmäßig aus** und mit leerem URL-Feld vorinstalliert ist; aktivieren Sie ihn nicht, macht die Erweiterung keinen Netzwerkaufruf zur Text-Konvertierung. Berechtigungen und deren Begründung stehen zeilenweise in [PRIVACY.md](https://vibenest.net/switcher/privacy), und der Data-Flow lässt sich gegen den Quellcode auf GitHub prüfen.

### Welche 12 Tastatur-Layouts werden unterstützt?

Englisch (US-QWERTY), Russisch (ЙЦУКЕН), Ukrainisch, Belarussisch, Deutsch (QWERTZ), Französisch (AZERTY), Griechisch, Hebräisch, Türkisch (Q-Tastatur), Polnisch (214), Spanisch (QWERTY) und Koreanisch (Dubeolsik / 두벌식). Jedes aktivierte Paar steht für die Erkennung bereit. Koreanisch ist der spannendste Fall: jede Hangul-Silbe auf dem Bildschirm wird umkehrbar in die Jamo-Tastenfolge zerlegt, damit derselbe Algorithmus (transponieren, dann bewerten) auch dort funktioniert. Brauchen Sie noch eines (Italienisch, Tschechisch, Hindi)? Eine Layout-Ergänzung sind zwei Dateien (Tabelle mit 46 Zeichen plus Top-3000-Wortliste); wir ergänzen sie, sobald wir sie verifizieren können. Issue auf GitHub eröffnen oder an **info@vibenest.net** schreiben.

### Ist es kostenlos? Open Source?

Beides ja. VibeNest Switcher ist kostenlos, ohne Konto, ohne Bezahlung, ohne Werbung. Der komplette Quellcode liegt auf GitHub unter <https://github.com/NikitaBabenko/Switcher> unter einer permissiven Open-Source-Lizenz. Sie können jede Zeile Code lesen, die mit Ihrem Text arbeitet. Genau das ist der Sinn der Datenschutz-Aussage: prüfbar statt deklarativ. Wenn Sie einen Bug finden oder eine Funktion vermissen, ist der Issue-Tracker der richtige Ort.

## VibeNest Switcher installieren

[**Aus dem Chrome Web Store installieren →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

- **GitHub**: <https://github.com/NikitaBabenko/Switcher>
- **Datenschutz**: <https://vibenest.net/switcher/privacy>
- **E-Mail**: **info@vibenest.net** für Vorschläge, Bug-Reports und Anfragen zu neuen Sprachen

---

*Punto Switcher ist eine Marke des jeweiligen Inhabers. VibeNest Switcher ist ein unabhängiges Open-Source-Projekt, weder mit Yandex verbunden noch von Yandex unterstützt.*
