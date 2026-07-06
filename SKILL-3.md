---
name: revision-logic
description: "Planlanan bir antrenman gerçekleşmediğinde (Strava'da o güne ait eşleşen aktivite bulunmadığında veya kullanıcı manuel olarak 'yapamadım' işaretlediğinde) planın nasıl yeniden düzenleneceğini tanımlar. Günlük/haftalık senkronizasyon sonrası otomatik olarak tetiklenmelidir."
---

# Otomatik Revizyon Mantığı

Bu dosya, planlanan ile gerçekleşen arasındaki farkı kapatmak için kullanılan kuralları tanımlar. Amaç kullanıcıyı suçlamadan, planı hayatına uyarlamaktır.

## 1. Tetikleyiciler

Revizyon şu durumlarda tetiklenir:
- Planlanan antrenman gününün sonunda o güne ait eşleşen Strava aktivitesi yoksa
- Kullanıcı arayüzden manuel "bugün yapamadım" işaretlerse
- Gerçekleşen aktivite planlanandan belirgin şekilde düşükse (mesafe planlananın %50'sinden az)

## 2. Kaçırma Sıklığına Göre Davranış

| Durum | Aksiyon |
|---|---|
| Haftada 1 kaçırma | Kaçırılan antrenman, haftanın kalan günlerine sessizce yeniden dağıtılır (mevcut dinlenme günlerinden birini antrenmana çevirmeden, uygun bir boşluğa yerleştirilir) |
| Haftada 2 kaçırma | Haftalık toplam hedef gerçekçi şekilde küçültülür (kaçırılanları sıkıştırmaya çalışılmaz); kalan günler `training-principles` kurallarına göre yeniden düzenlenir |
| Ardışık 2+ hafta düşük gerçekleşme (<%60) | Sistem otomatik revizyonu durdurur ve kullanıcıya hedef/frekansı gözden geçirme önerisi sunar — bu noktada `goal-assessment/SKILL.md` yeniden çalıştırılır |

## 3. Kısıtlar

- Revizyon hiçbir zaman `training-principles/SKILL.md` §1'deki %10 haftalık artış kuralını ihlal edecek şekilde antrenman sıkıştırması yapmaz.
- Uzun koşu, kaçırılırsa aynı hafta içinde başka bir güne taşınabilir ama asla iki uzun koşu aynı haftada art arda günlere yerleştirilmez.
- Taper haftalarında (yarış öncesi) revizyon hacmi artırma yönünde çalışmaz, yalnızca yeniden dağıtım yapar.

## 4. Kayıt

Her revizyon `revisions` tablosuna şu alanlarla kaydedilir: `sebep` (kaçırma/düşük gerçekleşme), `eski_plan`, `yeni_plan`, `tarih`. Bu kayıt hem kullanıcıya şeffaflık sağlamak hem de ileride PT'nin plan mantığını denetleyebilmesi için tutulur.

## 5. Kullanıcı İletişimi

Revizyon kullanıcıya bildirilirken:
- Kısa ve yargılayıcı olmayan bir dille ("plan bu haftaya göre güncellendi" gibi)
- Neyin değiştiğini somut olarak göstererek (eski/yeni plan karşılaştırması)
- Kullanıcıya revizyonu manuel geri alma seçeneği sunularak yapılır
