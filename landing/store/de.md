# VibeNest Switcher: Ausführliche Beschreibung (Deutsch)

Sie haben `ghbdtn` getippt, gemeint war `привет`. Drücken Sie `Strg+Umschalt+L`. Aus dem Kauderwelsch wird der richtige Text, ohne neu zu tippen, ohne das Feld zu verlassen, ohne dass auch nur ein Zeichen an einen Server geht.

VibeNest Switcher ist eine Chrome-Erweiterung, die Text aus einem falschen Tastaturlayout in einer einzigen Tastenkombination korrekt zurückschreibt. Standardmäßig läuft alles offline. Der Quellcode liegt auf GitHub. Im Lieferumfang sind 12 Tastaturlayouts (Englisch, Russisch, Ukrainisch, Belarussisch, Deutsch, Französisch, Griechisch, Hebräisch, Türkisch, Polnisch, Spanisch, Koreanisch) und 12 Übersetzungen der Benutzeroberfläche.

============================================================

WAS VIBENEST SWITCHER UNTERSCHEIDET

100% Open Source. Jede Codezeile, die mit Ihrem Text arbeitet, liegt offen auf GitHub: https://github.com/NikitaBabenko/Switcher. Tests lokal laufen lassen, aus dem Quellcode bauen, im eigenen Browser verifizieren.

Standardmäßig vollständig offline. Das Sprachmodell ist Teil des Erweiterungspakets, etwa 270 KB groß. Keine Telemetrie, kein Analytics, keine Cloud-Aufrufe, keine Drittanbieter-Skripte. Die Konvertierung verlässt das Gerät nie.

Kein Konto, keine Anmeldung, keine Bezahlung, keine Werbung. Installieren und nutzen.

12 Tastaturlayouts ab Werk. Die meisten Alternativen decken ein bis zwei Paare ab (Russisch/Englisch). VibeNest bearbeitet jedes Paar, das Sie aktivieren.

Moderner Manifest-V3-Build. Geprüfte Minimal-Berechtigungen, kompatibel mit der Chrome-Policy 2025. Kein Migrationsaufwand auf Ihrer Seite.

Browserübergreifend. Läuft in Chrome und jedem Chromium-Fork (Edge, Brave, Opera, Vivaldi). Eigenständige Builds für Edge und Firefox sind in der Roadmap.

============================================================

FUNKTIONSUMFANG

Tastenkombination (Strg+Umschalt+L) und Popup-Knopf in der Toolbar. Die Kombination schreibt das aktive Texteingabefeld direkt um. Das Popup zeigt einen Zweispalten-Modus mit dem Original und der korrigierten Version, praktisch für schreibgeschützte Felder oder wenn man die Konvertierung vor dem Anwenden ansehen will.

Einfügen-und-Korrigieren-Modus. Verstümmelten Text ins Popup einfügen, die korrigierte Version sehen, mit einem Klick herauskopieren. Funktioniert für Text, den Sie aus der Adressleiste, einem Export-View oder einem beliebigen schreibgeschützten Kontext kopiert haben.

Rechtsklick-Kontextmenü. Text auf der Seite markieren, Rechtsklick, "Layout korrigieren" wählen, ohne die Hand von der Maus zu nehmen.

Auto-Korrektur beim Tippen. Optional, standardmäßig aus. Wenn aktiviert, beobachtet die Erweiterung die Eingabe und korrigiert offensichtliche Wörter aus dem falschen Layout nach dem Leerzeichen. Rücktaste direkt nach der Auto-Korrektur macht sie rückgängig. Felder, die nach Passwortfeldern aussehen (input type=password, autocomplete=current-password), sowie OTP- und Kartennummern-Felder werden von der Auto-Korrektur per Codeentscheidung niemals angetastet.

Pro-Seite-Rückgängig. Das Popup hält einen einstufigen Rückgängig-Schritt für die letzte Korrektur auf der aktuellen Seite. Nützlich, wenn die Konvertierung in die falsche Richtung ging (etwa ein Eigenname an der Grenze zwischen Latein und Kyrillisch).

Site-Adapter. Vorgefertigte Handler für Seiten mit nicht-standardmäßigen Eingabefeldern (contenteditable-Wrapper, React-verwaltete Inputs, frame-isolierte Composer): Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. Ein generischer Adapter deckt alles andere ab.

Site-Richtlinien. Bestimmte Hosts blockieren (Bank, Intranet, Passwort-Manager) oder die Erweiterung auf eine Whitelist von vertrauten Hosts beschränken. Per-Host-Regeln bleiben über Sitzungen hinweg erhalten.

Smarte Sprach-Defaults. Beim ersten Öffnen liest die Erweiterung die Browser-Locale und wählt die wahrscheinlichsten Tippsprachen vor. Jederzeit in den Optionen änderbar. Die Erkennung läuft nur gegen die aktivierten Sprachen, dadurch bleiben Ergebnisse schnell und präzise.

12 Tastaturlayouts ab Werk. Englisch (US-QWERTY), Russisch (ЙЦУКЕН), Ukrainisch, Belarussisch, Deutsch (QWERTZ), Französisch (AZERTY), Griechisch, Hebräisch, Türkisch (Q), Polnisch (214), Spanisch (QWERTY), Koreanisch (Dubeolsik / 두벌식).

12 Übersetzungen der Benutzeroberfläche. Popup und Optionsseite sind für en, ru, uk, be, de, fr, el, he, tr, pl, es, ko lokalisiert. Für Hebräisch folgt das Popup der Schreibrichtung rechts-nach-links.

============================================================

WIE ES FUNKTIONIERT

Die Erkennungs-Engine transponiert jedes Zeichen durch jedes aktivierte Layout-Paar, dann bewertet ein Zeichen-Trigramm-Sprachmodell beide Richtungen. Das Modell ist auf den 3000 häufigsten Wörtern jeder Sprache trainiert. Die Richtung mit der höheren Punktzahl (die mehr nach natürlichem Text aussieht) wird auf das Feld angewendet.

Eine Caps-Lock-Heuristik und ein "Großschreibungs-Natürlichkeits"-Tiebreaker fangen die Randfälle ab: `hELLO` wird zu `Hello`, absichtliches `CAPS LOCK` bleibt unangetastet, gemischter Wortinnenraum wie `JavaScript` wird bewahrt.

Der Algorithmus ist bewusst ohne LLM. Es ist eine Transpositionstabelle plus ein kleiner statistischer Scorer. Dadurch wiegt das eingebettete Sprachmodell rund 270 KB und die Konvertierung läuft im Sub-Millisekundenbereich, was für den Inline-Einsatz in einem aktiven Texteingabefeld nötig ist. Weil das Modell mitgeliefert und eingefroren ist, verhält sich jede Installation gleich. Kein stilles Nachtrainieren auf einem Server hinter Ihrem Rücken.

Koreanisch ist der spannendste Fall in der Engine. Jede Hangul-Silbe auf dem Bildschirm wird umkehrbar in ihre Kompatibilitäts-Jamo-Tastenfolge zerlegt, damit derselbe Algorithmus (transponieren, dann bewerten) auch dort funktioniert. Nach dem Scoring wird das Ergebnis wieder zu Hangul-Silben zusammengesetzt.

============================================================

FÜR WEN ES GEMACHT IST

- Zweisprachige Schreibende, die täglich mehrfach zwischen Latein und einem anderen Schriftsystem wechseln.
- Übersetzerinnen und Übersetzer, die mitten im Absatz zwischen Ausgangs- und Zielsprache springen.
- Entwickler und IT-Fachkräfte in mehrsprachigen Umgebungen (Commit-Messages, Ticketkommentare, Code-Reviews über Kulturen hinweg).
- Helpdesk-Teams, die keine Mail mit "Уважаемые коллеги, ifkjvtt..." an Kolleginnen schicken wollen.
- Sprachstudierende, die Text zwischen Wörterbuch, Notizen und Chat mit dem Lehrer kopieren.
- Russlanddeutsche und alle, die in einem Multi-Skript-Workflow leben.

============================================================

DATENSCHUTZ

Standardmäßig läuft die Erweiterung offline. Der eingebettete Detektor lebt im Browser. Weder Text noch Metadaten noch Ereignisse werden irgendwohin gesendet. In der Erweiterung gibt es kein Analytics-SDK, keine Telemetrie, kein Remote-Logging und kein Drittanbieter-Skript. Das Paket ist klein genug, um es auf GitHub vollständig zu lesen.

Berechtigungen und Begründungen stehen zeilenweise in der Datenschutzerklärung: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

In den Optionen gibt es einen optionalen Remote-API-Fallback, standardmäßig aus, mit leerem URL-Feld. Wer ihn nie aktiviert, löst keinen einzigen Netzwerkaufruf für die Text-Konvertierung aus. Der Fallback existiert für Nutzende, die einen eigenen Konvertierungs-Endpunkt betreiben und wollen, dass das Popup dorthin spricht; er ist kein Default und erreicht nie einen Drittanbieter-Service.

============================================================

HÄUFIG GESTELLTE FRAGEN

F: Wie korrigiere ich Text, der in einem falschen Tastaturlayout getippt wurde?
A: Cursor in das Textfeld setzen, Strg+Umschalt+L drücken. Die Erweiterung erkennt das Layout-Paar, transponiert die Zeichen und schreibt das Feld an Ort und Stelle neu. Funktioniert in Twitter, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, Reddit, LinkedIn und jedem anderen Texteingabefeld im offenen Web.

F: Wie wechsle ich die Tastatursprache schnell im Browser?
A: VibeNest Switcher ersetzt nicht den System-Layout-Wechsel. Für den Wechsel zwischen Eingabesprachen verwenden Sie weiterhin die gewohnte System-Kombination. Die Erweiterung ist für etwas anderes: bereits getippten Text reparieren.

F: Transliteriert es Kyrillisch nach Latein?
A: Nein. Das ist Layout-Reparatur, kein phonetisches Tippen. Phonetische Eingabewerkzeuge, die ohne kyrillische Tastatur Russisch zu tippen helfen, sind eine andere Kategorie.

F: Funktioniert es offline?
A: Ja. Standardmäßig vollständig offline. Das Trigramm-Modell steckt im Erweiterungspaket. Weder Text noch Metadaten gehen irgendwohin.

F: Welche Berechtigungen braucht es und warum?
A: Minimal notwendig für browserweite Text-Reparatur: activeTab, scripting, storage, contextMenus. Jede einzeln in PRIVACY.md begründet.

F: Wie aktiviere ich die Auto-Korrektur beim Tippen?
A: Popup öffnen, Zahnrad-Symbol klicken, Auto-Korrektur einschalten. Mit der Rücktaste lässt sich jede Auto-Korrektur direkt nach dem Auslösen ablehnen.

F: Funktioniert es in Edge, Brave, Opera?
A: Ja, in jedem Chromium-basierten Browser. Edge holt sich MV3-Builds direkt aus dem Chrome Web Store.

F: Wird Layout X (Italienisch, Tschechisch, Hindi) ergänzt?
A: Ja, anfragen. Eine Layout-Ergänzung sind zwei Dateien (46-Zeichen-Tabelle plus Top-3000-Wortliste) plus Modell-Neuaufbau.

============================================================

UNTERSTÜTZTE SPRACHEN

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Eine weitere Sprache gebraucht? Issue auf GitHub eröffnen oder an info@vibenest.net schreiben.

============================================================

NEUES IN DER AKTUELLEN VERSION

Version 1.0.1 (13. Mai 2026)
- Em-Dashes aus UI-Strings und Landing-Texten entfernt für eine einheitliche Typografie.

Version 1.0.0 (12. Mai 2026)
- Stabile Veröffentlichung. Optionaler Remote-API-Fallback in den Einstellungen versteckt, standardmäßig aus mit leerem URL-Feld; die Standard-Installation erreicht das Netz nie.
- Datenschutztext in den Einstellungen aufgefrischt, spiegelt die Offline-zuerst-Haltung wider.
- Koreanische Hangul-Komposition und -Dekomposition empfohlener Pfad für 한영-Transposition.

Frühere Versionen brachten die Layouts Koreanisch, Polnisch und Spanisch (v0.3.0), Site-Adapter für Twitch und Mastodon sowie das Pro-Seite-Rückgängig.

============================================================

QUELLCODE UND KONTAKT

- GitHub: https://github.com/NikitaBabenko/Switcher
- Datenschutz: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md
- E-Mail für Vorschläge, Bug-Reports und Anfragen zu neuen Sprachen: info@vibenest.net

