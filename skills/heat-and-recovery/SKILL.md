---
name: heat-and-recovery
description: "Bir aktivitede nabız/tempo oranı beklenenden saptığında (örn. düşük tempoya rağmen yüksek nabız) bu sapmanın kondisyon kaybı mı yoksa dış etken mi olduğunu değerlendirmek için kullanılır. Aktivite analizi ve motivasyon/geri bildirim mesajları üretilirken çağrılmalıdır."
---

# Nabız Sapması ve Toparlanma Değerlendirmesi

Bu dosya, tek bir kötü aktiviteyi kondisyon kaybı olarak yanlış yorumlamamak için kullanılır. Amaç, kullanıcıya doğru ve motive edici geri bildirim vermektir.

## 1. Sapma Tespiti

Bir aktivite şu durumda "beklenenden sapmış" kabul edilir:
- Ortalama nabız, kullanıcının benzer tempodaki son 4 haftalık ortalamasının belirgin üzerindeyse, VEYA
- Tempo, benzer nabız aralığındaki son 4 haftalık ortalamanın belirgin altındaysa

## 2. Olası Dış Etkenler (Kontrol Sırası)

Sapma tespit edildiğinde sistem sırasıyla şu etkenleri kontrol eder:

1. **Aynı gün önceki aktivite** — o gün için `activities_cache`'te daha erken saatli başka bir aktivite (yüzme, bisiklet vb.) var mı? Varsa ve aralarındaki süre kısaysa (< 3 saat), birikmiş yorgunluk olası sebep olarak işaretlenir.
2. **Uzun ara sonrası ilk aktivite** — bu aktivite, 10+ günlük bir aradan sonraki ilk aktiviteyse, düşük performans beklenen bir durumdur.
3. **Hava koşulları** — konum ve tarih bilgisiyle (varsa hava API'si) sıcaklık kontrol edilir; yüksek sıcaklık nabzı yükseltip temponun düşmesine yol açan bilinen bir etkendir.
4. **Yukarıdakilerin hiçbiri yoksa** — sapma "izlenmesi gereken" olarak işaretlenir ama tek bir veri noktasından kondisyon kaybı sonucu çıkarılmaz; en az 2-3 benzer sapma tekrarlanmadan bu yönde bir değerlendirme yapılmaz.

## 3. Kullanıcıya Geri Bildirim Kuralları

- Tespit edilen dış etken varsa, bu açıkça ve veriye dayalı belirtilir (örn. "aynı gün daha önce yüzmüşsün, bu nabız sapmasını açıklıyor").
- Kondisyon kaybıymış gibi asılsız endişe yaratılmaz; dil daima açıklayıcı ve normalleştirici olmalı.
- Sapma nedeniyle kullanıcı motivasyon kaybı belirtisi gösteriyorsa (örn. arka arkaya aktivite girmeme), sistem bir sonraki öneride hedefi/temposu değil sadece "geri dönüş" çerçevesini vurgular — bkz. `revision-logic/SKILL.md` §5 iletişim kuralları.

## 4. Plan Motoruna Geri Bildirim

Tespit edilen dış etken geçiciyse (o günkü hava, o günkü çoklu aktivite), bu durum kullanıcının genel kondisyon değerlendirmesine (`goal-assessment/SKILL.md`) dahil edilmez — yalnızca o aktiviteye özel bir not olarak kalır. Ancak tekrarlayan bir örüntü varsa (örn. sürekli aynı gün çoklu spor yapılıyor), bu örüntü frekans önerisine (`training-principles/SKILL.md` §2) yansıtılır.
