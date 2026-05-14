# VibeNest Switcher: Ayrıntılı açıklama (Türkçe)

`merhaba` yazmak isterken `ьукрфиф` çıktı. `Ctrl+Shift+L` tuşuna bas. Anlamsız harfler doğru metne dönüşür. Yeniden yazmadan, alandan çıkmadan, sunucuya tek bir karakter göndermeden.

VibeNest Switcher, yanlış klavye düzeniyle yazılmış metni tek bir tuş kombinasyonuyla doğru hâline döndüren bir Chrome eklentisidir. Varsayılan olarak her şey çevrimdışı çalışır. Kaynak kod GitHub'da. Pakette 12 klavye düzeni (İngilizce, Rusça, Ukraynaca, Belarusça, Almanca, Fransızca, Yunanca, İbranice, Türkçe, Polonyaca, İspanyolca, Korece) ve 12 arayüz çevirisi yer alır.

============================================================

VIBENEST SWITCHER'I NE FARKLI KILIYOR

100% açık kaynak. Metninle çalışan her satır kod GitHub'da herkese açık: https://github.com/NikitaBabenko/Switcher.

Varsayılan olarak tamamen çevrimdışı. Dil modeli eklenti paketinin içine gömülmüş, yaklaşık 270 KB. Telemetri yok, analytics yok, bulut çağrıları yok, üçüncü taraf betikler yok.

Hesap yok, oturum açma yok, ödeme yok, reklam yok. Yükle ve kullan.

Kutudan 12 klavye düzeni. Çoğu alternatif bir ya da iki çift (Rusça/İngilizce) kapsar. VibeNest etkinleştirdiğin her çifti işler.

Modern Manifest V3 yapısı. Denetlenmiş minimum izinler, Chrome 2025 politikasına hazır.

Tarayıcılar arası. Chrome ve her Chromium fork'unda (Edge, Brave, Opera, Vivaldi) çalışır.

============================================================

NE YAPAR

Klavye kısayolu (Ctrl+Shift+L) ve araç çubuğunda açılır pencere düğmesi. Kısayol aktif metin alanını yerinde yeniden yazar. Açılır pencere iki bölmeli bir görünüm sunar: özgün metin ve düzeltilmiş hali.

Yapıştır-ve-düzelt modu. Yanlış metni açılır pencereye yapıştır, düzeltilmiş hali gör, tek tıkla kopyala.

Sağ tık bağlam menüsü. Sayfada metin seçili, sağ tık, "Düzeni düzelt" seç. Fareyi bırakmadan.

Sayfa bazlı geri al. Açılır pencere geçerli sayfadaki son düzeltme için tek adımlı geri al tutar.

Site adaptörleri. Standart dışı girdiler için hazır işleyiciler: Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. Genel bir adaptör kalan siteleri kapsar.

Site politikası. Belirli alanları (bankan, intraneti, parola yöneticini) engelle veya eklentiyi güvenilir hostların beyaz listesiyle sınırla. Host başına kurallar oturumlar arasında korunur.

Akıllı dil varsayılanları. Eklentiyi ilk açtığında tarayıcının yerel ayarını okur ve en olası yazma dillerini seçer. Seçenekler'de istediğin zaman değiştirebilirsin.

Kutudan 12 klavye düzeni. İngilizce (US QWERTY), Rusça (ЙЦУКЕН), Ukraynaca, Belarusça, Almanca (QWERTZ), Fransızca (AZERTY), Yunanca, İbranice, Türkçe (Q), Polonyaca (214), İspanyolca (QWERTY), Korece (Dubeolsik / 두벌식).

12 arayüz çevirisi. Açılır pencere ve Seçenekler sayfası en, ru, uk, be, de, fr, el, he, tr, pl, es, ko için yerelleştirildi. İbranice için açılır pencere sağdan sola yönü takip eder.

============================================================

NASIL ÇALIŞIR

Algılama motoru her karakteri etkin olan tüm düzen çiftlerinden geçirerek yer değiştirir, sonra her dil için en sık 3,000 kelimeyle eğitilmiş bir karakter trigram dil modeli her iki yönü puanlar. Daha yüksek puan alan yön (doğal metne daha çok benzeyen) alana uygulanır.

Caps Lock buluşsal yöntemi ve "büyük-küçük harf doğallığı" tiebreaker kenar durumları halleder: `hELLO` `Hello` olur, kasıtlı `CAPS LOCK` aynı kalır, `JavaScript` gibi kelime ortası karışık büyük-küçük harfler korunur.

Algoritma bilinçli olarak LLM kullanmaz. Bir yer değiştirme tablosu artı küçük bir istatistiksel puanlayıcıdır. Bu sayede gömülü dil modeli yaklaşık 270 KB ağırlığındadır ve dönüşüm milisaniyenin altında çalışır. Model gömülü ve donuk olduğu için her kurulum aynı davranır.

Korece motordaki en ilginç durumdur. Ekrandaki her Hangul hecesi geri döndürülebilir biçimde uyumluluk jamo dizisine ayrılır, böylece aynı "yer değiştir ve puanla" algoritması orada da işler. Puanlamadan sonra sonuç Hangul hecelerine geri birleştirilir.

============================================================

KİMLER İÇİN

- Her gün birden fazla kez Türkçe ile başka bir alfabe arasında geçiş yapan iki dilliler.
- Çevirmenler.
- Uluslararası ekiplerdeki geliştiriciler ve BT çalışanları.
- Destek ekipleri.
- Dil öğrencileri ve öğretmenleri.
- Çok yazı sistemli iş akışında çalışan herkes.

============================================================

GİZLİLİK

Varsayılan olarak eklenti çevrimdışı çalışır. Gömülü algılayıcı tarayıcıda yaşar. Ne metin ne meta veri hiçbir yere gönderilmez. Eklentide analytics SDK'sı, telemetri, uzak günlük veya üçüncü taraf betikler yok.

İzinler ve gerekçeleri gizlilik politikasında satır satır açıklanır: https://vibenest.net/switcher/privacy

Seçeneklerde isteğe bağlı bir uzak API yedeği var, varsayılan kapalı, URL alanı boş.

============================================================

SIKÇA SORULAN SORULAR

S: Yanlış klavye düzeniyle yazılmış metni nasıl düzeltirim?
C: İmleci metin alanına koy, Ctrl+Shift+L tuşuna bas. Eklenti düzen çiftini algılar, karakterleri yer değiştirir ve alanı yerinde yeniden yazar.

S: Tarayıcıda klavye dilini nasıl hızlıca değiştiririm?
C: VibeNest Switcher işletim sistemindeki aktif düzen değişimini değiştirmez. Giriş dilleri arasında geçiş için olağan sistem kombinasyonunu kullanmaya devam et. Eklenti zaten yazılmış metni düzeltmek için.

S: Kirili Latin'e fonetik olarak çevirir mi?
C: Hayır. Bu düzen düzeltmedir, fonetik yazım değil. Fiziksel klavyesi olmayan alfabeler için fonetik yazım araçları ayrı bir kategoridir.

S: Çevrimdışı çalışıyor mu?
C: Evet. Varsayılan olarak tamamen çevrimdışı.

S: Hangi izinlere ihtiyaç duyuluyor ve neden?
C: Tarayıcıda metin yeniden yazımı için en az gereken: activeTab, scripting, storage, contextMenus. Her biri PRIVACY.md'de gerekçelendirilmiş.

S: Edge, Brave, Opera'da çalışır mı?
C: Evet, Chromium tabanlı her tarayıcıda. Edge MV3 yapılarını doğrudan Chrome Web Store'dan alır.

S: X düzenini (Hintçe, İtalyanca, Çekçe) ekler misiniz?
C: Evet, talep edin. Bir düzen eklemek iki dosyadır (46 karakter tablosu artı 3,000 kelimelik liste) artı model yeniden derlemesi.

============================================================

DESTEKLENEN DİLLER

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Başka biri mi gerekiyor? GitHub'da issue aç veya info@vibenest.net adresine yaz.

============================================================

YENİLİKLER

Sürüm 1.0.1 (13 Mayıs 2026)
- Tutarlı bir tipografi için arayüz dizgilerinden ve landing metinlerinden uzun tireler kaldırıldı.

Sürüm 1.0.0 (12 Mayıs 2026)
- Kararlı yayın. İsteğe bağlı uzak API yedeği Ayarlar'da gizli, varsayılan kapalı, URL alanı boş.
- Ayarlardaki gizlilik metni çevrimdışı önceliklı duruşa uyacak şekilde yenilendi.
- Korece Hangul birleştirme/ayrıştırma 한영 yer değiştirmesi için önerilen yol.

============================================================

KAYNAK KOD VE İLETİŞİM

- GitHub: https://github.com/NikitaBabenko/Switcher
- Gizlilik politikası: https://vibenest.net/switcher/privacy
- Öneri, hata bildirimi ve yeni dil talepleri için e-posta: info@vibenest.net

