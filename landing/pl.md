---
title: "Układ klawiatury: przełącznik i poprawka błędów w 12 językach"
description: "Rozszerzenie Chrome poprawia tekst wpisany w niewłaściwym układzie klawiatury jednym skrótem. 12 układów (polski, rosyjski, niemiecki, koreański), offline, open source."
slug: switcher
locale: pl
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
canonical: https://vibenest.net/pl/switcher
og_image: /og/switcher-pl.png
schema:
  - SoftwareApplication
  - FAQPage
  - BreadcrumbList
keywords_primary: układ klawiatury
keywords_secondary:
  - zmiana układu klawiatury
  - klawiatura rosyjska chrome
  - poprawka tekstu klawiatura
  - polska klawiatura
last_updated: 2026-05-13
---

<!-- TODO: Web Store ID - zamień `vibenest-switcher` w CTA po publikacji. -->

# Układ klawiatury: przełącznik i poprawka błędów w 12 językach

Wpisałeś `ghbdtn` zamiast `привет`. **VibeNest Switcher** to rozszerzenie do Chrome, które poprawia tekst napisany w niewłaściwym układzie klawiatury jednym skrótem. Bez zaznaczania, bez kopiowania, bez przepisywania. Wykrywanie działa offline, kod jest na GitHubie, a w pakiecie znajduje się 12 układów klawiatury (polski, rosyjski, niemiecki, francuski, hiszpański, koreański i sześć innych).

[**Zainstaluj z Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

> **Open source · Offline · 12 układów klawiatury · Manifest V3 · Bez telemetrii · Bez konta · Za darmo**

## Popraw zły układ klawiatury jednym skrótem

Kto codziennie pisze w łacińce i cyrylicy (albo w polskim, angielskim i rosyjskim, albo w każdej innej parze, w której klawisze się nakładają), zna ten rytm. Zapomniałeś przełączyć układ, spojrzałeś na ekran, zaznaczyłeś, usunąłeś, napisałeś od nowa. Systemowy przełącznik układu pomaga tylko z *następną* literą, nie poprawia tego, co już jest na ekranie. VibeNest Switcher to dokładnie ten brakujący guzik: kursor w polu, **`Ctrl+Shift+L`**, pole zostaje przepisane na miejscu we właściwym układzie. Działa w dowolnym polu tekstowym w otwartym webie: Twitter/X, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, LinkedIn, Reddit.

### Było / Po poprawce

| Wpisałeś (zły układ) | Co miałeś na myśli |
|---|---|
| `ghbdtn` | `привет` |
| `Руддщ` | `Hello` |
| `Czesc` (w cyrylicy) | `Цяуыс` |
| `Lf, ds nfv;t!` | `Да, вы там же!` |
| `xfq c kbvjyjv` | `чай с лимоном` |

Ten sam skrót działa w dowolnym kierunku między wszystkimi 12 obsługiwanymi układami. Możesz też wkleić zły tekst do popupu w pasku narzędzi i skopiować z niego poprawioną wersję jednym kliknięciem.

## Problem złego układu, o którym się nie mówi

Bilingualne osoby polsko-angielskie, tłumacze, programiści i administratorzy w międzynarodowych zespołach, helpdesk, studenci języków: każdy zna ten mikropodatek. Kilka sekund na poprawkę, dziesiątki razy dziennie. W skali roku to dni życia stracone na jedno złe przyzwyczajenie między ręką a systemem.

Systemowy przełącznik układu klawiatury tego nie rozwiązuje. Zmienia aktywny układ wejścia, ale nie naprawia tego, co już wpisałeś. Transliteratory fonetyczne (Translit, Cyrillatin) też nie rozwiązują tego problemu. Służą do pisania w cyrylicy bez cyrylicznej klawiatury, literując słowa fonetycznie (`privet` zamiast `привет`). To zupełnie inna kategoria. **VibeNest Switcher rozwiązuje dokładnie ten moment**: skończyłeś pisać, zauważyłeś, że układ był zły, i chcesz to naprawić jednym ruchem, nie wychodząc z pola.

Klasyczna odpowiedź na desktopie to mała rodzina narzędzi do automatycznej zmiany układu w locie. Wszystkie zamknięte, wszystkie tylko pod Windows, niezdolne sięgnąć do nowoczesnych aplikacji webowych, gdzie dziś dzieje się większość pisania. VibeNest Switcher to alternatywa open source, działająca natywnie w przeglądarce, w pełni offline: pracuje w polu, w którym faktycznie piszesz, na każdym systemie, w którym chodzi Chrome lub Chromium.

## Co potrafi

- **Skrót klawiszowy** (`Ctrl+Shift+L`) i przycisk popup w pasku narzędzi: błyskawiczna poprawka aktywnego pola
- **Tryb wklej-i-popraw**: wklej zły tekst do popupu, zobacz poprawioną wersję, skopiuj jednym kliknięciem
- **Menu kontekstowe prawym kliknięciem** na zaznaczonym tekście, bez odrywania ręki od myszki
- **Automatyczna poprawka w trakcie pisania**: opcjonalna, domyślnie wyłączona; Backspace cofa każdą auto-poprawkę
- **Cofnięcie per-strona**: cofa ostatnią poprawkę na bieżącej stronie jednym kliknięciem
- **Adaptery dla serwisów**: Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon, plus uniwersalny adapter dla wszystkiego innego
- **Polityka serwisów**: zablokuj konkretne hosty (bank, intranet) albo ogranicz rozszerzenie do whitelisty zaufanych
- **Inteligentne domyślne ustawienia językowe**: przy pierwszej instalacji rozszerzenie czyta locale przeglądarki i wybiera najbardziej prawdopodobne języki pisania; możesz to zmienić w Opcjach w każdej chwili
- **12 układów klawiatury z pudełka**: angielski (US QWERTY), rosyjski (ЙЦУКЕН), ukraiński, białoruski, niemiecki (QWERTZ), francuski (AZERTY), grecki, hebrajski, turecki (Q), polski (214), hiszpański (QWERTY), koreański (Dubeolsik). Koreański to przypadek specjalny: silnik rozkłada sylaby hangul na jamo przed transpozycją i składa je z powrotem
- **12 tłumaczeń interfejsu** dla popupu i panelu Opcji: en, ru, uk, be, de, fr, el, he, tr, pl, es, ko

Manifest V3, zaudytowane minimalne uprawnienia, gotowe pod politykę Chrome 2025 bez migracji po twojej stronie.

## Jak to działa

Detektor transponuje każdy znak przez każdą włączoną parę układów, a potem znakowy model trigramowy, trenowany na top-3000 słów dla każdego języka, ocenia oba kierunki i wybiera ten, który wygląda jak naturalny tekst. Heurystyka Caps Lock i tie-breaker "naturalności rejestru" obsługują przypadki brzegowe (`hELLO` staje się `Hello`, intencjonalny CAPS LOCK zostaje nienaruszony). To wszystko dzieje się w twojej przeglądarce: nic nie idzie do zdalnego modelu, żadne wywołanie API, żadnego opóźnienia sieciowego w pętli.

Algorytm jest **bez LLM**. To tabela transpozycji plus mały scoring statystyczny. Dzięki temu wbudowany model językowy waży około 270 KB, a konwersja trwa poniżej milisekundy: dokładnie ten profil, jakiego trzeba do użycia inline w dowolnym polu tekstowym. Model jest wbudowany i zamrożony, więc każda instalacja zachowuje się identycznie. Żadnego cichego dotrenowywania na serwerze za twoimi plecami.

## Jak VibeNest Switcher wypada na tle innych

To wąska kategoria. Sensowne alternatywy różnią się na kilku osiach, które są istotne dla większości użytkowników: czy kod da się przejrzeć, co opuszcza urządzenie, ile układów obsługuje narzędzie z pudełka oraz czy działa w przeglądarce, czy tylko na desktopie.

| | **VibeNest Switcher** | EasyType Switcher | Caramba Switcher | Punto Switcher |
|---|---|---|---|---|
| Open source (sprawdzalne) | Tak, MIT, kod na GitHubie | Nie | Nie | Nie |
| W pełni offline / bez telemetrii | Tak, model wbudowany, zero sieci | Zamknięty kod, niesprawdzalne | Desktop | Desktop |
| Liczba układów klawiatury | **12** | 2 (RU/EN) | 2-3 | 2 (RU/EN) |
| Manifest V3 / natywnie w przeglądarce | Tak, MV3, gotowe pod politykę 2025 | Tak, MV3 | Nie, tylko desktop | Nie, tylko desktop |
| Wieloplatformowość | Tak, każdy OS z Chrome / Chromium | Tak, każdy OS z Chrome | Nie, tylko Windows | Nie, tylko Windows |
| Auto-poprawka w trakcie pisania | Tak, opcjonalna, świadoma haseł | Tak | Tak | Tak |
| Aktywnie utrzymywane (2026) | Tak, otwarty tracker zgłoszeń | Sporadycznie | Tak | Tak |

VibeNest Switcher to jedyna linia, w której jednocześnie stoi open source, natywna praca w przeglądarce i pełny offline. Jeśli kiedyś chciałeś mieć działanie desktopowego "przełącznika w locie", ale bez zamkniętej binarki i bez wysyłania tekstu poza urządzenie, to dokładnie ta nisza.

[**Zainstaluj z Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

## Najczęściej zadawane pytania

### Jak poprawić tekst wpisany w złym układzie klawiatury?

Zainstaluj VibeNest Switcher, postaw kursor w polu z błędnym tekstem i naciśnij **`Ctrl+Shift+L`**. Rozszerzenie rozpozna, w jakiej parze układów napisałeś tekst, transponuje znaki i przepisze pole na miejscu. Nie musisz nic zaznaczać, kopiować ani przepisywać. Ten sam skrót działa w Twitterze, Slacku, Telegram Webie, WhatsApp Webie, Discordzie, Gmailu, Notionie, Redditcie, LinkedInie i każdym innym polu tekstowym w otwartym webie. Jeśli pola nie da się zmienić bezpośrednio (na przykład widok eksportu tylko do odczytu), rozszerzenie skopiuje poprawiony tekst do schowka i pokaże małą notyfikację.

### Jak szybko zmienić układ klawiatury w przeglądarce?

VibeNest Switcher nie zastępuje systemowej zmiany aktywnego układu. Do przełączania języków wpisywania nadal używaj zwykłej kombinacji systemowej. Rozszerzenie jest do czego innego: poprawia już wpisany tekst. Jeśli zacząłeś pisać po angielsku, a w systemie był włączony rosyjski (`Руддщ` zamiast `Hello`), jeden skrót przepisze pole. W drugą stronę tak samo: `ghbdtn` staje się `привет` w milisekundę, bez dodatkowych kliknięć i bez wychodzenia z pola.

### Czy to wielojęzyczne narzędzie?

Tak. VibeNest Switcher to wielojęzyczny korektor układu klawiatury z 12 układami (angielski, rosyjski, ukraiński, białoruski, niemiecki, francuski, grecki, hebrajski, turecki, polski, hiszpański, koreański) i pełnymi tłumaczeniami interfejsu. W przeciwieństwie do narzędzi pojedynczej pary, VibeNest wykrywa i konwertuje między dowolną parą włączonych układów. Włącz tylko te języki, których faktycznie używasz; detekcja celuje w aktywny zestaw, dzięki czemu wyniki są szybsze i dokładniejsze. Jeśli piszesz w trzech lub więcej alfabetach dziennie, to znaczący skok jakości względem narzędzi dwuukładowych.

### Czym różni się od Punto Switcher?

To aplikacja desktopowa pod Windows. VibeNest Switcher to niezależna alternatywa open source, która w całości działa wewnątrz Chrome i każdej przeglądarki Chromium, czyli na macOS, Linuxie, ChromeOS i Windowsie tak samo. I pracuje w polach webowych, gdzie dzisiaj odbywa się większość pisania. Idea detekcji jest taka sama (transponuj, potem oceń), ale model jest wbudowany w rozszerzenie i pracuje offline. Żaden znak twojego tekstu nie opuszcza przeglądarki. Kod źródłowy jest na [GitHubie](https://github.com/NikitaBabenko/Switcher), więc deklarację o prywatności da się zweryfikować w źródłach, a nie tylko przyjąć na słowo.

### Czy to transliteruje cyrylicę na łacinkę (lub odwrotnie)?

Nie. To poprawka układu, nie pisanie fonetyczne. Jeśli szukasz narzędzia do pisania rosyjskiego na klawiaturze tylko z układem US, literując słowa fonetycznie (`privet` zamiast `привет`, `spasibo` zamiast `спасибо`), to inna kategoria (Cyrillatin, Translit). VibeNest Switcher jest dla przypadku, w którym oba układy już masz, napisałeś w niewłaściwym przypadkiem, i chcesz wynik poprawić na miejscu. Obie kategorie rozwiązują sąsiednie problemy, ale nie są wymienne.

### Czy działa offline? Co opuszcza moją przeglądarkę?

W pełni offline domyślnie. Wbudowany model trigramowy mieszka w paczce rozszerzenia; detekcja chodzi na twoim urządzeniu. **Ani tekst, ani metadane nigdzie nie wychodzą.** Bez SDK analityki, bez telemetrii, bez zdalnego logowania, bez skryptów stron trzecich. W Opcjach jest opcjonalny fallback na zdalny API, **domyślnie wyłączony**, z pustym polem URL; jeśli sam go nie włączysz, rozszerzenie nie zrobi ani jednego zapytania sieciowego związanego z konwersją tekstu. Uprawnienia i ich uzasadnienia są spisane linijka po linijce w [PRIVACY.md](https://vibenest.net/switcher/privacy), a ścieżkę przepływu danych da się sprawdzić w kodzie na GitHubie.

### Jakie 12 układów klawiatury jest obsługiwanych?

Angielski (US QWERTY), rosyjski (ЙЦУКЕН), ukraiński, białoruski, niemiecki (QWERTZ), francuski (AZERTY), grecki, hebrajski, turecki (Q), polski (214), hiszpański (QWERTY) i koreański (Dubeolsik / 두벌식). Dowolna włączona para staje się dostępna do detekcji. Koreański to najciekawszy przypadek: każda sylaba hangul na ekranie odwracalnie rozkłada się w sekwencję jamo, żeby ten sam algorytm transpozycji ze scoringiem zadziałał i tam. Potrzebujesz innego (hindi, włoski, czeski)? Dodanie układu to dwa pliki (tabela 46 znaków plus lista top-3000 słów) i robimy to tak szybko, jak zdążymy zweryfikować. Otwórz issue na GitHubie albo napisz na **info@vibenest.net**.

### Czy jest darmowe? Open source?

Tak na oba pytania. VibeNest Switcher jest darmowe, bez konta, bez płatności, bez reklam. Pełny kod źródłowy leży na GitHubie pod <https://github.com/NikitaBabenko/Switcher> na permisywnej licencji open source. Możesz przeczytać każdą linię kodu, która pracuje z twoim tekstem. O to chodzi w deklaracji prywatności: sprawdzalna, nie deklaratywna. Jeśli znajdziesz buga albo chcesz nową funkcję, tracker zgłoszeń jest właściwym miejscem.

## Zainstaluj VibeNest Switcher

[**Zainstaluj z Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

- **GitHub**: <https://github.com/NikitaBabenko/Switcher>
- **Polityka prywatności**: <https://vibenest.net/switcher/privacy>
- **E-mail**: **info@vibenest.net** w sprawie sugestii, zgłoszeń błędów i próśb o nowe języki

---

*Punto Switcher to znak towarowy odpowiedniego właściciela. VibeNest Switcher to niezależny projekt open source, niezwiązany z Yandex i niewspierany przez Yandex.*
