# VibeNest Switcher: Szczegółowy opis (Polski)

Wpisałeś `ghbdtn`, a chciałeś `привет`. Naciśnij `Ctrl+Shift+L`. Bełkot zamienia się we właściwy tekst, bez przepisywania, bez wychodzenia z pola, bez wysyłania ani jednego znaku na serwer.

VibeNest Switcher to rozszerzenie do Chrome, które poprawia tekst napisany w niewłaściwym układzie klawiatury jednym skrótem. Domyślnie wszystko działa offline. Kod jest na GitHubie. W pakiecie znajduje się 12 układów klawiatury (angielski, rosyjski, ukraiński, białoruski, niemiecki, francuski, grecki, hebrajski, turecki, polski, hiszpański, koreański) i 12 tłumaczeń interfejsu.

============================================================

CO ODRÓŻNIA VIBENEST SWITCHER

100% otwarty kod źródłowy. Każda linia kodu, która pracuje z twoim tekstem, leży otwarcie na GitHubie: https://github.com/NikitaBabenko/Switcher. Możesz uruchomić testy lokalnie, zbudować rozszerzenie ze źródeł, zweryfikować we własnej przeglądarce.

Domyślnie w pełni offline. Model językowy jest wbudowany w pakiet rozszerzenia, około 270 KB. Bez telemetrii, bez analityki, bez wywołań do chmury, bez skryptów stron trzecich. Konwersja nigdy nie opuszcza urządzenia.

Bez konta, bez logowania, bez płatności, bez reklam. Instalujesz i pracujesz.

12 układów klawiatury z pudełka. Większość alternatyw obsługuje jedną lub dwie pary (rosyjski/angielski). VibeNest obsługuje dowolną parę, którą włączysz.

Nowoczesna budowa Manifest V3. Audytowane minimalne uprawnienia, gotowość do polityki Chrome 2025. Brak migracji po twojej stronie.

Wieloprzeglądarkowo. Działa w Chrome i każdym forku Chromium (Edge, Brave, Opera, Vivaldi). Samodzielne porty pod Edge i Firefox w mapie drogowej.

============================================================

CO POTRAFI

Skrót klawiszowy (Ctrl+Shift+L) i przycisk popup w pasku narzędzi. Skrót przepisuje aktywne pole tekstowe na miejscu. Popup daje dwupanelowy widok z oryginałem i wersją poprawioną, przydatny przy polach tylko do odczytu albo gdy chcesz obejrzeć konwersję przed jej zastosowaniem.

Tryb wklej-i-popraw. Wklej zły tekst do popupu, zobacz wersję poprawioną, skopiuj jednym kliknięciem. Działa dla tekstu, który już skopiowałeś z paska adresu, widoku eksportu lub dowolnego kontekstu tylko do odczytu.

Menu kontekstowe prawym kliknięciem. Zaznacz tekst na stronie, prawy klik, wybierz "Popraw układ", bez odrywania ręki od myszki.

Automatyczna poprawka w trakcie pisania. Opcjonalna, domyślnie wyłączona. Po włączeniu rozszerzenie śledzi pisanie i poprawia oczywiste słowa z "nie tego układu" po spacji. Backspace zaraz po auto-poprawce ją cofa. Pola wyglądające jak pola haseł (input type=password, autocomplete=current-password) oraz pola OTP i numerów kart są twardo wykluczone z automatycznej poprawki w kodzie.

Cofnięcie per-strona. Popup trzyma jednokrokowe cofnięcie ostatniej poprawki na bieżącej stronie. Przydatne, gdy konwersja poszła w niewłaściwym kierunku.

Adaptery dla serwisów. Gotowe handlery dla stron z niestandardowymi polami wprowadzania (otoczki contenteditable, inputy zarządzane przez React, kompozytory w izolowanych ramkach): Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. Adapter uniwersalny pokrywa pozostałe strony.

Polityka serwisów. Zablokuj konkretne hosty (twój bank, intranet, menedżer haseł) albo ogranicz rozszerzenie do whitelisty zaufanych. Reguły per-host utrzymują się między sesjami.

Inteligentne domyślne ustawienia językowe. Przy pierwszym otwarciu rozszerzenie czyta locale przeglądarki i wybiera najbardziej prawdopodobne języki pisania. Zmienisz w Opcjach w każdej chwili. Detekcja działa tylko na włączonych językach, dzięki czemu wyniki są szybkie i dokładne.

12 układów klawiatury z pudełka. Angielski (US QWERTY), rosyjski (ЙЦУКЕН), ukraiński, białoruski, niemiecki (QWERTZ), francuski (AZERTY), grecki, hebrajski, turecki (Q), polski (214), hiszpański (QWERTY), koreański (Dubeolsik / 두벌식).

12 tłumaczeń interfejsu. Popup i panel Opcji są zlokalizowane na en, ru, uk, be, de, fr, el, he, tr, pl, es, ko. Dla hebrajskiego popup idzie z prawej do lewej.

============================================================

JAK TO DZIAŁA

Detektor transponuje każdy znak przez każdą włączoną parę układów, potem znakowy model trigramowy ocenia oba kierunki. Model jest trenowany na top-3000 słów dla każdego języka. Kierunek z wyższym wynikiem (ten, który bardziej wygląda na naturalny tekst) trafia do pola.

Heurystyka Caps Lock i tie-breaker "naturalności rejestru" obsługują przypadki brzegowe: `hELLO` staje się `Hello`, intencjonalny `CAPS LOCK` zostaje nienaruszony, mieszany rejestr w środku słowa typu `JavaScript` jest zachowany.

Algorytm jest świadomie bez LLM. To tabela transpozycji plus mały scoring statystyczny. Dzięki temu wbudowany model językowy waży około 270 KB, a konwersja trwa poniżej milisekundy. Model jest wbudowany i zamrożony, więc każda instalacja zachowuje się identycznie. Żadnego cichego dotrenowywania na serwerze za twoimi plecami.

Koreański to najciekawszy przypadek w silniku. Każda sylaba hangul na ekranie odwracalnie rozkłada się w sekwencję jamo, żeby ten sam algorytm "transponuj, potem oceń" zadziałał i tam. Po scoringu wynik składa się z powrotem w sylaby hangul.

============================================================

DLA KOGO

- Bilingualni piszący, którzy kilka razy dziennie przełączają się między polskim a innym alfabetem.
- Tłumacze przeskakujący między językiem źródłowym a docelowym w środku akapitu.
- Programiści i pracownicy IT w międzynarodowych zespołach (commit messages, komentarze w trackerze, code review między kulturami).
- Zespoły wsparcia, które nie chcą wysyłać koledze maila zaczynającego się od "Уважаемые коллеги, ifkjvtt..."
- Studenci i nauczyciele języków.
- Każdy, kto pracuje w wieloskryptowym workflow.

============================================================

PRYWATNOŚĆ

Domyślnie rozszerzenie pracuje offline. Wbudowany detektor mieszka w przeglądarce. Ani tekst, ani metadane, ani zdarzenia nigdzie się nie wysyłają. W rozszerzeniu nie ma SDK analityki, nie ma telemetrii, nie ma zdalnego logowania, nie ma skryptów stron trzecich. Paczka jest na tyle mała, żeby przeczytać ją w całości na GitHubie.

Wszystkie uprawnienia i ich uzasadnienia są spisane linijka po linijce w polityce prywatności: https://vibenest.net/switcher/privacy

W Opcjach jest opcjonalny fallback na zdalny API, domyślnie wyłączony, pole URL puste. Jeśli sam go nie włączysz, rozszerzenie nie zrobi ani jednego zapytania sieciowego związanego z konwersją tekstu.

============================================================

CZĘSTO ZADAWANE PYTANIA

P: Jak poprawić tekst wpisany w złym układzie klawiatury?
O: Postaw kursor w polu tekstowym, naciśnij Ctrl+Shift+L. Rozszerzenie rozpozna parę układów, transponuje znaki i przepisze pole na miejscu. Działa w Twitterze, Slacku, Discordzie, Telegram Webie, WhatsApp Webie, Gmailu, Notionie, Redditcie, LinkedInie i każdym innym polu tekstowym w otwartym webie.

P: Jak szybko zmienić układ klawiatury w przeglądarce?
O: VibeNest Switcher nie zastępuje systemowej zmiany układu. Do przełączania języków pisania nadal używaj zwykłej kombinacji systemowej. Rozszerzenie jest do czego innego: poprawia już wpisany tekst.

P: Czy transliteruje cyrylicę na łacinkę?
O: Nie. To poprawka układu, nie pisanie fonetyczne. Narzędzia pisania fonetycznego służące do pisania bez fizycznej klawiatury należą do innej kategorii.

P: Czy działa offline?
O: Tak. W pełni offline domyślnie. Model trigramowy wewnątrz paczki rozszerzenia. Ani tekst, ani metadane nigdzie nie wychodzą.

P: Jakie uprawnienia są potrzebne i po co?
O: Minimum niezbędne do przepisywania tekstu w przeglądarce: activeTab, scripting, storage, contextMenus. Każde uzasadnione w PRIVACY.md.

P: Jak włączyć automatyczną poprawkę podczas pisania?
O: Otwórz popup rozszerzenia, kliknij koło zębate, przełącz Auto-poprawkę. Backspace cofa auto-poprawkę natychmiast po jej zadziałaniu.

P: Czy działa w Edge, Brave, Opera?
O: Tak, w każdej przeglądarce opartej na Chromium. Edge bierze buildy MV3 prosto z Chrome Web Store.

P: Czy dodacie układ X (hindi, włoski, czeski)?
O: Tak, zgłoś prośbę. Dodanie jednego układu to dwa pliki (tabela 46 znaków plus lista top-3000 słów) plus przebudowa modelu.

============================================================

OBSŁUGIWANE JĘZYKI

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Potrzebujesz innego? Otwórz issue na GitHubie albo napisz na info@vibenest.net.

============================================================

CO NOWEGO

Wersja 1.0.1 (13 maja 2026)
- Usunięte em-dashes z ciągów interfejsu i tekstów lendingów dla spójnej typografii.

Wersja 1.0.0 (12 maja 2026)
- Stabilne wydanie. Opcjonalny fallback na zdalny API ukryty w Ustawieniach, domyślnie wyłączony z pustym polem URL; domyślna instalacja nigdy nie idzie do sieci.
- Odświeżony tekst prywatności w Ustawieniach, odzwierciedla postawę offline-first.
- Kompozycja i dekompozycja koreańskiego hangul rekomendowana jako główna ścieżka dla transpozycji 한영.

Wcześniejsze wydania dodały układy koreański, polski i hiszpański (v0.3.0), adaptery dla Twitcha i Mastodona oraz cofnięcie per-strona.

============================================================

KOD ŹRÓDŁOWY I KONTAKT

- GitHub: https://github.com/NikitaBabenko/Switcher
- Polityka prywatności: https://vibenest.net/switcher/privacy
- E-mail do sugestii, zgłoszeń błędów i próśb o nowe języki: info@vibenest.net

