# KBM ders çalışma sitesi

celikemir.github.io: kuantum yüksek lisans derslerinin (KBM 601, KBM 602) haftalık çalışma defterleri. Her hafta bir HTML sayfası (genelde claude.ai'den indirilmiş bir artifact) ilgili dersin altına eklenir. GitHub Pages `master` dalından yayınlıyor, build adımı yok.

## Yapı

```
index.html          ana sayfa: iki ders kartı (601, 602)
kbm.css             ana sayfa ve ders sayfalarının ortak stili
favicon.svg
601/index.html      Hafta 1–14 kutuları
601/hafta-N/        o haftanın defteri (index.html + kendi dosyaları, ör. boards/*.jpg)
602/index.html
602/hafta-N/
```

Tüm bağlantılar göreceli (`../`, `../../favicon.svg`), mutlak yol kullanma.

## Yeni hafta eklemek

Kullanıcı "601 hafta 7" gibi bir şey deyip bir zip veya HTML verdiğinde:

1. Dosyaları `<ders>/hafta-N/` içine koy, ana sayfa `index.html` olsun. Yayınlamadan önce HTML'i oku.
2. Sayfanın başında derse dönüş bağlantısı yoksa ekle (örnek: `601/hafta-6/index.html` içindeki `.crumbs` satırı: `KBM notları › 601 › Hafta 6`).
3. claude.ai'ye özel şeyler (`window.claude`, artifact capability çağrıları) GitHub Pages'te çalışmaz. Varsa kullanıcıya söyle.
4. `<ders>/index.html`: o haftanın `<span class="wk empty">` satırını Hafta 6'daki gibi bir `<a class="wk" href="hafta-N/">` bağlantısına çevir. Başlık (`.t`) ve alt satır (`.m`, ör. "30 Ekim · 18 tahta · 45 soru") sayfanın içeriğinden alınır.
5. Kök `index.html`: o dersin şeridinde N'inci `<i>`'ye `class="on"` ekle ve `.meta` satırını güncelle (ör. "Hazır: Hafta 6, 7").
6. Commit'le ve push'la. Push başarısız olursa (SSH anahtarı şifreli, agent boş olabilir) kullanıcıdan kendi terminalinde `git push origin master` çalıştırmasını iste.
