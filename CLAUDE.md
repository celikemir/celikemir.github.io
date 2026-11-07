# KBM ders çalışma sitesi

celikemir.github.io: kuantum yüksek lisans derslerinin (KBM 601, KBM 602) haftalık çalışma defterleri. Her hafta bir HTML sayfası (genelde claude.ai'den indirilmiş bir artifact) ilgili dersin altına eklenir. GitHub Pages `master` dalından yayınlıyor, build adımı yok.

## Yapı

```
index.html          ana sayfa: iki ders kartı
kbm.css             ana sayfa, ders sayfaları ve yazılı notların ortak stili
favicon.svg
601/                KBM 601 Kuantum teknolojileri için kuantum mekaniği
  index.html        Hafta 1–14 kutuları
  hafta-N/          o haftanın notu (index.html + kendi dosyaları, ör. boards/*.jpg, ders-notu.html)
602/                KBM 602 Nanofotoniğin temelleri
  index.html        Hafta 1–14 kutuları + altta "Nanofotonik serisi" listesi
  hafta-N/
  nanofotonik/      Bölüm 0–4 (Hafta 1–2'nin notları; 602'deki Hafta 1–2 kutuları buraya gidiyor)
```

Tüm bağlantılar göreceli (`../`, `../../favicon.svg`), mutlak yol kullanma.

Kullanıcının zip'lerinde bazen `ozel/` klasörü olur (ödev çözümleri). Onu asla repoya koyma; site herkese açık.

Tahta fotoğraflarına tek tek bak: hoca ya da başka biri görünüyorsa kullanıcı onun tamamen çıkarılmasını istiyor. Aynı tahtanın temiz bir fotoğrafı varsa o kareyi at ve sayfadaki bağlantıyı temiz fotoğrafa çevir. Yoksa kişiyi kırp ve kalanını bulanıklaştır, `<img>`'nin width/height değerlerini yeni boyuta göre güncelle. Alt metinlerde ve açıklamalarda "hoca gösteriyor" gibi ifadeleri de düzelt (örnek: 602 Hafta 7).

## Yeni hafta eklemek

Kullanıcı "601 hafta 7" gibi bir şey deyip bir zip veya HTML verdiğinde:

1. Dosyaları `<ders>/hafta-N/` içine koy, ana sayfa `index.html` olsun. Yayınlamadan önce HTML'i oku.
2. Sayfanın başında derse dönüş bağlantısı yoksa ekle (örnek: `601/hafta-6/index.html` içindeki `.crumbs` satırı: `KBM notları › 601 › Hafta 6`).
3. claude.ai'ye özel şeyler (`window.claude`, artifact capability çağrıları) GitHub Pages'te çalışmaz. Varsa kullanıcıya söyle.
4. `<ders>/index.html`: o haftanın `<span class="wk empty">` satırını Hafta 6'daki gibi bir `<a class="wk" href="hafta-N/">` bağlantısına çevir. Başlık (`.t`) ve alt satır (`.m`, ör. "30 Ekim · 18 tahta · 45 soru") sayfanın içeriğinden alınır.
5. Kök `index.html`: o dersin şeridinde N'inci `<i>`'ye `class="on"` ekle ve `.meta` satırını güncelle (ör. "Hazır: Hafta 6, 7").
6. Commit'le ve push'la. Push başarısız olursa (SSH anahtarı şifreli, agent boş olabilir) kullanıcıdan kendi terminalinde `git push origin master` çalıştırmasını iste.
