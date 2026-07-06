---
name: goal-assessment
description: "Kullanıcı yeni bir hedef girdiğinde (yarış, milestone, tempo hedefi vb.) bu dosya kullanılarak hedefin mevcut kondisyon seviyesine göre gerçekçiliği değerlendirilir. Hedef girişi adımından hemen sonra, plan üretilmeden önce çağrılmalıdır."
---

# Hedef Gerçekçilik Değerlendirmesi

Bu dosya, kullanıcının girdiği hedefi Strava geçmişiyle karşılaştırıp bir risk seviyesi belirlemek için kullanılır. Amaç kullanıcıyı caydırmak değil, gerçekçi bir yol haritası sunmaktır.

## 1. Girdi Verisi

Değerlendirme için `activities_cache` tablosundan şu veriler çekilir:
- Son 8 haftalık ortalama haftalık mesafe ve frekans
- Son 8 haftadaki en uzun tekil koşu
- Son aktiviteden bugüne geçen gün sayısı (aktivite arası boşluk)
- Varsa geçmiş yarış/PR verileri (relative effort, ortalama tempo)

## 2. Risk Sınıflandırması

Hedef üç kategoriden birine yerleştirilir:

| Kategori | Kriter | Sistem Davranışı |
|---|---|---|
| **Güvenli** | Hedef mesafe, son 8 haftadaki en uzun koşunun ≤ 1.5 katı VE hedef tarihine kalan süre `training-principles`'daki %10 kuralına göre yeterli | Plan doğrudan üretilir |
| **Zorlayıcı** | Hedef mesafe en uzun koşunun 1.5-2.5 katı ARASINDA veya süre sınırda yeterli | Plan üretilir, kullanıcıya "zorlayıcı ama ulaşılabilir" uyarısı ve ara milestone'lar gösterilir |
| **Riskli** | Hedef mesafe en uzun koşunun 2.5 katından fazla, VEYA son 14+ gündür aktivite yok VEYA süre %10 kuralına göre yetersiz | Hedef olduğu gibi plana alınmaz; kullanıcıya gerçekçi bir ara hedef (örn. yarı mesafe, daha ileri tarih) önerilir. Kullanıcı ısrar ederse orijinal hedef "uzun vadeli hedef", önerilen ara hedef "ilk milestone" olarak kaydedilir |

## 3. Uzun Aradan Dönüş Durumu

Son aktiviteden bugüne 14+ gün geçmişse, değerlendirme "mevcut kondisyon" olarak **son aktif dönemin ortalamasını değil, düşürülmüş bir başlangıç seviyesini** esas alır (bkz. `training-principles/SKILL.md` §1). Bu durumda hedefe giden süre otomatik olarak yeniden hesaplanır ve kullanıcıya bildirilir.

## 4. İletişim Tonu

Riskli/zorlayıcı hedeflerde kullanıcıya sunulan mesaj:
- Caydırıcı değil, bilgilendirici olmalı ("bu hedefe X yerine Y haftada daha güvenli ulaşılır" gibi)
- Somut veriye dayanmalı (kullanıcının kendi geçmiş verisiyle gerekçelendirilmeli)
- Kullanıcıya her zaman orijinal hedefte ısrar etme seçeneği bırakmalı
