# KBM ders çalışma sitesi

celikemir.github.io: kuantum yüksek lisans derslerinin (KBM 601, KBM 602) haftalık çalışma defterleri. Her hafta bir HTML sayfası (genelde claude.ai'den indirilmiş bir artifact) ilgili dersin altına eklenir. GitHub Pages `master` dalından yayınlıyor, build adımı yok.

## Yapı

```
index.html          ana sayfa (İngilizce, site bununla açılır): iki ders kartı
tr.html             ana sayfanın Türkçesi
kbm.css             ana sayfa, ders sayfaları ve yazılı notların ortak stili
favicon.svg
601/                KBM 601 Kuantum teknolojileri için kuantum mekaniği
  index.html        Hafta 1–14 kutuları (İngilizce, haftaların en.html'ine gider)
  tr.html           aynı liste Türkçe (haftaların index.html'ine gider)
  hafta-N/          o haftanın notu (index.html Türkçe, en.html İngilizce + kendi dosyaları, ör. boards/*.jpg, ders-notu.html)
602/                KBM 602 Nanofotoniğin temelleri
  index.html        Hafta 1–14 kutuları + altta "Nanofotonik serisi" listesi (İngilizce)
  tr.html           aynı liste Türkçe
  hafta-N/
  nanofotonik/      Bölüm 0–4 (Hafta 1–2'nin notları; 602'deki Hafta 1–2 kutuları buraya gidiyor)
```

Tüm bağlantılar göreceli (`../`, `../../favicon.svg`), mutlak yol kullanma.

Bir haftanın yeni sürümü gelince eskisi silinmez: yeni çalışma defteri `hafta-N/index.html` olur, eski yazılı not `hafta-N/ders-notu.html` olarak kalır ve iki sayfa birbirine bağlantı verir (örnek: 601 Hafta 2, 3, 4, 6).

Bir haftanın İngilizce sürümü varsa `hafta-N/en.html` olarak durur, aynı `boards/` klasörünü kullanır ve Türkçe sayfayla birbirine bağlantı verir (örnek: 601 Hafta 5). İngilizce sayfanın ilerleme kaydı ayrı bir localStorage anahtarında tutulur (`kbm-<ders>-haftaN-en-v1`). Türkçe ders listesinde (`<ders>/tr.html`) o haftanın `.m` satırının sonuna " · English" eklenir.

Site varsayılan olarak İngilizce açılır. Türkçe sayfalardaki (`hafta-N/index.html`, `ders-notu.html`) ana sayfa ve ders bağlantıları `tr.html`'e gider (`../tr.html`, `../../tr.html`), İngilizce sayfalardakiler `../`, `../../` olarak kalır. Yeni bir Türkçe sayfa eklerken bu bağlantıları da `tr.html`'e çevir.

Kullanıcının zip'lerinde bazen `ozel/` klasörü olur (ödev çözümleri). Onu asla repoya koyma; site herkese açık. Hocanın derste tahtada "HW" diye ya da sözlü olarak "evde yapın" diye bıraktığı türetmelerin çözümü defterde durabilir; kullanıcı bunu onayladı (601 Hafta 2 ve 7, 602 Hafta 8). Moodle'a teslim edilen numaralı ödev kağıtlarının (Ödev 1, Ödev 5 gibi) çözümü ise yüklenmez; böyle bir şey görürsen kullanıcıya sor.

Tahta fotoğraflarına tek tek bak: hoca ya da başka biri görünüyorsa kullanıcı onun tamamen çıkarılmasını istiyor. Aynı tahtanın temiz bir fotoğrafı varsa o kareyi at ve sayfadaki bağlantıyı temiz fotoğrafa çevir. Yoksa kişiyi kırp ve kalanını bulanıklaştır, `<img>`'nin width/height değerlerini yeni boyuta göre güncelle. Alt metinlerde ve açıklamalarda "hoca gösteriyor" gibi ifadeleri de düzelt (örnek: 602 Hafta 7).

Aynı şey hocanın kişisel bilgileri için de geçerli: tahtada ya da sayfa metninde hocanın adı, e-postası, odası veya özgeçmişi (okulları, şu an çalıştığı yer) varsa fotoğrafta o bölgeyi bulanıklaştır, metinden ve alt metinlerden çıkar (örnek: 601 Hafta 1, t01 ve t02).

## 601 tahta kilidi

601'in tahta fotoğrafları herkese bulanık görünür; asılları yalnızca kullanıcı şifreyle açar. Her `601/hafta-N/boards/X.jpg` bulanık kopyadır, asıl fotoğraf yanında `X.jpg.enc` olarak AES-GCM ile şifreli durur. Sayfalarda `</body>`'den önce `<script src="../../tahta.js" defer></script>` vardır. Şifre `tahta-kilit.json`'da anahtarı sarar; şifreyi yalnızca kullanıcı bilir, sen bilmezsin.

- 601'e yeni bir hafta (ya da tahta fotoğrafı) gelince commit'ten önce `python3 tools/tahta.py kilitle 601/hafta-N` çalıştır ve sayfaya script satırını ekle. Anahtar bu bilgisayarda `~/.config/kbm-tahta/anahtar`'dadır; asılların yedeği `~/.config/kbm-tahta/asil/`'e gider.
- 601'in asıl (bulanık olmayan) tahta fotoğrafını asla commit'leme: her `boards/*.jpg`'nin yanında `.enc` olmalı. Geçmiş 27 Kasım 2026'da bunun için temizlendi.
- Şifreyi değiştirmek: kullanıcı kendi terminalinde `python3 tools/tahta.py sifre` çalıştırır, sonra `tahta-kilit.json` commit'lenir.

## Sesli özet eklemek

Kullanıcı bir haftaya ses dosyası (ör. .m4a) verirse:

- Dosyayı `hafta-N/sesli-ozet.m4a` olarak koy. Adı ASCII olsun.
- Sayfaya `601/hafta-8/index.html`'deki "Sesli özet" kartını kopyala. Kart üç parçadan oluşur: `.listen` CSS bloğu, `</header>`'dan hemen sonraki `<section class="wrap listen">` ve sayfa sonundaki küçük script. Script'teki localStorage anahtarını haftaya göre değiştir (`kbm-<ders>-haftaN-ses`); başlığı ve süreyi de güncelle (süre için `ffprobe`). 602 sayfalarında `.tag`, `.speed` ve `.listen` başka işlere ayrıldığı için kartın `so-` önekli, sayfanın renk değişkenlerine uyan sürümü kullanılır (örnek: `602/hafta-3/index.html`). Hafta 1–2'nin sesi Nanofotonik Bölüm 1 ve 3'te durur.
- İngilizce sürüm (`en.html`) varsa kartı oraya da koy: aynı dosya ve aynı anahtar, etiket "Audio summary", alt satır "In Turkish · N minutes".
- Ders listesinde o haftanın `.m` satırının sonuna ekle: `<ders>/tr.html`'e " · sesli özet", `<ders>/index.html`'e " · audio summary in Turkish" (ses İngilizceyse " · audio summary").
- Sesin içini dinleyemiyorsun. Kullanıcıya bunu söyle: hocanın adı ya da ödev çözümü geçiyorsa haber versin.
- Haftanın yeni bir sürümü gelirse kartı ve ses dosyasını yeni sayfaya taşı, kaybolmasın.

## Yeni hafta eklemek

Kullanıcı "601 hafta 7" gibi bir şey deyip bir zip veya HTML verdiğinde:

1. Dosyaları `<ders>/hafta-N/` içine koy, ana sayfa `index.html` olsun. Yayınlamadan önce HTML'i oku.
2. Sayfanın başında derse dönüş bağlantısı yoksa ekle (örnek: `601/hafta-6/index.html` içindeki `.crumbs` satırı: `KBM notları › 601 › Hafta 6`).
3. claude.ai'ye özel şeyler (`window.claude`, artifact capability çağrıları) GitHub Pages'te çalışmaz. Varsa kullanıcıya söyle.
4. `<ders>/tr.html`: o haftanın `<span class="wk empty">` satırını Hafta 6'daki gibi bir `<a class="wk" href="hafta-N/">` bağlantısına çevir. Başlık (`.t`) ve alt satır (`.m`, ör. "30 Ekim · 18 tahta · 45 soru") sayfanın içeriğinden alınır. `<ders>/index.html`'de aynısını İngilizce yap; `en.html` varsa `href="hafta-N/en.html"`, yoksa `href="hafta-N/"` ve alt satıra " · in Turkish" ekle.
5. Kök `index.html` ve `tr.html`: o dersin şeridinde N'inci `<i>`'ye `class="on"` ekle ve `.meta` satırını güncelle (ör. "Ready: Weeks 1–8", "Hazır: Hafta 1–8").
6. Commit'le ve push'la. Push başarısız olursa (SSH anahtarı şifreli, agent boş olabilir) kullanıcıdan kendi terminalinde `git push origin master` çalıştırmasını iste.
