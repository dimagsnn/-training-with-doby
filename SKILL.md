---
name: training-principles
description: "Kullanıcı için haftalık antrenman planı üretilirken veya güncellenirken bu dosya kullanılır. Mesafe/tempo artış oranları, dinlenme günü oranları, uzun koşu yerleşimi ve taper (yarış öncesi yükü azaltma) mantığını tanımlar. Plan motoru her yeni haftalık plan ürettiğinde veya mevcut planı revize ettiğinde bu kurallara başvurmalıdır."
---

# Antrenman İlerleme Prensipleri

Bu dosya, plan üretim motorunun uyması gereken temel antrenman kurallarını tanımlar. Kurallar PT tarafından onaylanmıştır; değişiklik yalnızca PT onayıyla yapılmalıdır.

## 1. Haftalık Yük Artışı

- Toplam haftalık mesafe, bir önceki haftaya göre **%10'dan fazla artırılmaz.**
- Kullanıcı 14 günden uzun süre ara vermişse (Strava verisinden tespit edilir), yeni plan **son aktif haftalık ortalamanın altında** başlar ve oradan kademeli artırılır — ara öncesi seviyeden değil.
- Ardışık 3 haftalık artıştan sonra 4. hafta "deload" (yük azaltma) haftası olarak planlanır: hacim ~%20-30 düşürülür.

## 2. Dinlenme ve Frekans Dağılımı

- Haftalık frekans ne olursa olsun (kullanıcı onayladığı/girdiği değer, bkz. training_frequency tablosu), art arda 2 günden fazla koşu günü planlanmaz; en az bir dinlenme veya çok hafif aktivite günü araya girer.
- Haftada 4 veya daha fazla gün koşu planlanıyorsa, en az biri "kolay tempo" (rahat konuşma temposu) olarak işaretlenir.

## 3. Uzun Koşu Yerleşimi

- Haftalık plan içinde en uzun koşu, haftanın diğer koşularından belirgin şekilde uzun olur (genel oran: haftalık toplam mesafenin ~%25-35'i).
- Uzun koşudan sonraki gün otomatik olarak dinlenme veya çok hafif aktivite olarak işaretlenir.

## 4. Tempo Yönlendirmesi

- Plan, mutlak tempo hedefi yerine öncelikle **nabız bölgesi veya "hissedilen zorluk"** üzerinden yönlendirme yapar; sabit dakika/km hedefleri yalnızca kullanıcının hedefe yakın olduğu son 2-3 haftada devreye girer.
- Kullanıcının geçmiş aktivitelerinden çıkarılan ortalama/maksimum nabız verisi, zorluk seviyesini kalibre etmek için kullanılır (bkz. `heat-and-recovery/SKILL.md` sapma durumları için).

## 5. Taper (Yarış/Hedef Öncesi Azaltma)

- Hedef bir yarış veya belirli bir tarihse, hedef tarihinden önceki son 1-2 hafta (hedef mesafeye göre) hacim kademeli azaltılır, yoğunluk korunur.
- Taper haftalarında yeni bir kişisel rekor denemesi planlanmaz.

## 6. Sınır Durumlar

- Üretilen plan, kullanıcının `goal-assessment/SKILL.md` kurallarına göre "riskli" işaretlenmiş bir hedefi karşılıyorsa, plan motoru hedefi olduğu gibi değil, gerçekçi ara kilometre taşlarıyla böler ve kullanıcıya bunu açıkça belirtir.
