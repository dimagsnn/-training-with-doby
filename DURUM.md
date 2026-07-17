# DURUM.md — Proje Durumu (17 Temmuz 2026 itibarıyla)

Bu dosya, projeye kaldığımız yerden devam etmek için gereken her şeyi içerir. Yeni bir oturuma başlarken bu dosyayı oku.

## Proje Özeti

Strava entegrasyonlu, hedef bazlı, otomatik revize olan kişisel antrenman planlama uygulaması. Detaylı mimari ve süreç akışı: `docs/Surec_ve_Mimari_Dokumani.docx`.

**Onay durumu:** PT tarafından mimari/süreç dokümanı onaylandı. SKILL.md dosyaları da PT'ye gösterilmek üzere hazırlandı (onay teyidi henüz netleşmedi — bir sonraki oturumda teyit edilebilir).

## Teknik Kararlar

- **Frontend/Backend:** Next.js (App Router, TypeScript, Tailwind, ESLint) — Vercel'de barındırılacak
- **Veritabanı:** Supabase (Postgres + Auth)
- **Dış entegrasyon:** Strava API (OAuth)
- **Kod editörü/agent:** **Cursor** (ücretsiz plan) — Claude Code değil, kullanıcı ücret ödemek istemedi
- **Sürüm kontrolü:** GitHub, kimlik doğrulama **GitHub CLI (`gh auth login`)** ile çözüldü
- **Deploy:** Vercel Dashboard üzerinden (GitHub push → otomatik build), **Vercel CLI kullanılmıyor** (yasak listede)

## Repo Bilgisi

- **Lokal yol:** `/Users/dimagsayin/Documents/training-with-doby`
- **GitHub:** `https://github.com/dimagsnn/-training-with-doby.git` (repo adının başında `-` var, dikkat)
- **Mac kullanıcı adı:** `dimagsayin`, GitHub kullanıcı adı: `dimagsnn`

## Supabase Şeması (Güncel — 6/7 Temmuz 2026)

Proje: `training-with-doby` (Supabase, Frankfurt bölgesi). Data API açık, "expose new tables" kapalı, otomatik RLS açık şeklinde kuruldu.

Oluşturulan tablolar (hepsinde RLS aktif, `auth.uid() = user_id` politikasıyla):
- `profiles`, `strava_connections`, `goals`, `training_frequency`, `plans`, `activities_cache`, `revisions`
- **Sonradan eklendi:** `planned_workouts` (günlük planlanan antrenman — tarih, tür, hedef mesafe/süre/nabız aralığı) ve `activities_cache.matched_planned_workout_id` sütunu

**Not:** Supabase arayüzü güncellendi — artık `anon`/`service_role` yerine `publishable`/`secret` adında yeni tip anahtarlar birincil gösteriliyor (aynı işlevi görüyorlar). Project URL artık Settings → API yerine **Integrations → Data API** altında; anahtarlar **Configuration → API Keys** altında. `.env.local`'de eski isimlendirmeyi (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) koruduk, sadece içine yeni tip değerleri (`sb_publishable_...`, `sb_secret_...`) yazdık — kod tarafında değişiklik gerekmiyor.

**Eklenme sebebi:** Takvim görünümü isteği — her güne tıklandığında planlanan ile gerçekleşen (Strava/akıllı saat verisi) yan yana, hatta çizgi grafikte planlanan/gerçekleşen iki renkli karşılaştırma gösterilecek. Bu, mimari dokümanına da §3.4 Takvim Görünümü olarak ve yol haritasına Faz 6 olarak eklendi.

## Şu Ana Kadar Tamamlananlar (Faz 1 — kısmen)

1. ✅ Next.js iskeleti kuruldu (`npx create-next-app@latest . --typescript --tailwind --app --eslint`)
2. ✅ `.cursorrules` dosyası repo köküne kondu (yasak komutlar: `supabase db reset/push --linked`, `DROP`, `TRUNCATE`, `DELETE WHERE TRUE`, `--yes/--force`, `git reset --hard`/`push -f`, Vercel CLI deploy, secret rotation)
3. ✅ `KURULUM.md` repo köküne kondu (Faz 1'in tam adım listesi)
4. ✅ `skills/` klasörü oluşturuldu, 4 SKILL.md dosyası doğru yerlere kondu:
   - `skills/training-principles/SKILL.md`
   - `skills/goal-assessment/SKILL.md`
   - `skills/revision-logic/SKILL.md`
   - `skills/heat-and-recovery/SKILL.md`
5. ✅ `docs/Surec_ve_Mimari_Dokumani.docx` kondu
6. ✅ Git commit + GitHub'a push edildi (`gh auth login` ile kimlik doğrulama çözüldü)
7. ✅ claude.ai'da ayrı bir **Project** oluşturuldu, Custom Instructions ve SKILL.md'ler + mimari doküman Project Knowledge'a yüklendi (bu, Cursor'daki repo'dan bağımsız — sohbet/analiz tarafı için)

## Faz 2 — Strava OAuth (TAMAMLANDI — 8 Temmuz 2026)

Cursor Composer 2.5 (Multitask modu) ile uygulandı. Oluşturulan dosyalar:
- `lib/supabase/server.ts` — Supabase SSR client
- `lib/strava/config.ts`, `lib/strava/oauth.ts`, `lib/strava/activities.ts`
- `app/api/strava/connect/route.ts` — OAuth başlatma (anonim giriş + Strava'ya yönlendirme)
- `app/api/strava/callback/route.ts` — token değişimi + `strava_connections`'a upsert
- `app/page.tsx` — "Strava'ya Bağlan" butonu / bağlıysa son 10 aktivite listesi

**Karşılaşılan ve çözülen sorunlar (tekrar yaşamamak için):**
1. `strava_connections.user_id` üzerinde UNIQUE constraint yoktu → eklendi (`upsert onConflict: "user_id"` için gerekli):
   ```sql
   alter table strava_connections add constraint strava_connections_user_id_key unique (user_id);
   ```
2. Supabase'de anonim giriş varsayılan kapalıydı → Authentication → Sign In / Providers'dan açıldı
3. **En kritik sorun:** "expose new tables" kapalı kurulduğu için (bilinçli güvenlik tercihi) tablolar `authenticated` rolüne hiç açılmamıştı, `permission denied for table strava_connections` hatası verdi → her tabloya ayrı ayrı grant çalıştırıldı:
   ```sql
   grant select, insert, update, delete on table profiles to authenticated;
   grant select, insert, update, delete on table strava_connections to authenticated;
   grant select, insert, update, delete on table goals to authenticated;
   grant select, insert, update, delete on table training_frequency to authenticated;
   grant select, insert, update, delete on table plans to authenticated;
   grant select, insert, update, delete on table activities_cache to authenticated;
   grant select, insert, update, delete on table revisions to authenticated;
   grant select, insert, update, delete on table planned_workouts to authenticated;
   ```
   Not: RLS politikaları buna ek olarak hâlâ devrede — grant = "role bu tabloya dokunabilir mi", RLS = "bu role hangi satırlara dokunabilir", ikisi birlikte çalışıyor.

**Sonuç:** OAuth akışı uçtan uca çalışıyor — Strava'ya bağlan → yetkilendir → geri dön → gerçek Strava aktiviteleri sayfada listeleniyor.

**⚠️ Önemli düzeltme (17 Temmuz 2026):** Faz 2'nin tüm kodu (`route.ts` dosyaları, `lib/strava/*`, `lib/supabase/server.ts`) o güne kadar **sadece lokal'de duruyordu, hiç commit'lenmemişti**. 17 Temmuz'daki commit'te (`7a5668e`) hepsi "create mode" olarak ilk kez göründü. Yani DURUM.md'de "tamamlandı" yazması ile GitHub'a gitmiş olması aynı şey değilmiş — bundan sonra her önemli değişiklikten hemen sonra `git status` ile commit'lenmemiş dosya kalmadığını kontrol etmek gerekiyor.

## Faz 2.1 — Token Yenileme (TAMAMLANDI — 17 Temmuz 2026)

Cursor'ın ücretsiz plan agent kotası dolduğu için (2 gün sonra yenileniyormuş) bu kısım **elle, Cursor'ın normal dosya editöründen** (agent kullanmadan) yapıldı — Claude kodu verdi, kullanıcı manuel yapıştırdı.

Değişen dosyalar:
- `lib/strava/oauth.ts` — `refreshAccessToken` fonksiyonu eklendi (mevcut `exchangeCodeForToken` ile aynı `application/x-www-form-urlencoded` formatı kullanıldı, tutarlılık için)
- `app/page.tsx` — `connection` tipine `refresh_token`, `expires_at` eklendi; Supabase select'ine bu sütunlar eklendi; aktivite çekmeden önce `expires_at` kontrolü yapılıp süresi dolmuşsa `refreshAccessToken` çağrılıp `strava_connections` güncelleniyor; `activitiesError` state'i ile hata kullanıcıya gösteriliyor

`npm run build` temiz geçti, commit'lendi ve push edildi (`7a5668e`).

**Not:** Gerçek senaryoda test edilmedi (6 saatlik token süresi dolmadı) — `expires_at`'i Supabase Table Editor'den elle geçmiş bir tarihe çekip test etmek bir sonraki oturumda yapılabilir.

## Bilinçli Olarak Ertelenenler / Henüz Yapılmayanlar

- ❌ **Vercel'e bağlanmadı** — bilinçli olarak erteledik, artık test edilebilir bir özellik olduğu için (Strava OAuth çalışıyor) bir sonraki adımlardan biri
- ✅ **Supabase projesi oluşturuldu ve şema kuruldu** (bkz. yukarıdaki "Supabase Şeması" bölümü)
- ✅ **Strava OAuth kuruldu ve test edildi** (bkz. yukarıdaki "Faz 2" bölümü) — uçtan uca çalışıyor
- ✅ İlk sayfa (`app/page.tsx`) yazıldı — bağlan butonu + aktivite listesi

## Bir Sonraki Adımlar (öncelik sırasıyla)

1. ⏭️ **BURADAN DEVAM:** Token yenilemeyi gerçek senaryoda test et — Supabase Table Editor'de `strava_connections.expires_at`'i geçmiş bir tarihe çek, sayfayı yenile, otomatik yenilenip yenilenmediğini gözlemle
2. Anonim girişi gerçek kullanıcı sistemine (e-posta/magic link) çevirme — şu an MVP test amaçlı anonim girişle çalışıyor
3. Vercel'e bağlan ve gerçek bir deploy test et (artık test edilebilir bir özellik var, mantıklı zaman)
4. Strava callback domain'ine Vercel URL'sini de ekle (strava.com/settings/api, "localhost" yanına)
5. Aktiviteleri `activities_cache` tablosuna senkronize etme (şu an sadece canlı Strava API'den çekip gösteriyoruz, veritabanına yazmıyoruz)
6. Daha sonra: takvim görünümü (Faz 6) — planned_workouts ile activities_cache eşleştirmesi, planlanan/gerçekleşen çizgi grafiği

**Genel kural (17 Temmuz'daki commit sürprizinden sonra):** Her oturumun sonunda mutlaka `git status` çalıştırılıp "nothing to commit" görülmeden oturum kapatılmamalı.

## `.env.local` Durumu (8 Temmuz 2026 itibarıyla)

- ✅ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key) dolduruldu ve doğrulandı
- ✅ `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` dolduruldu ve doğrulandı — OAuth akışı çalışıyor
- ✅ `NEXT_PUBLIC_APP_URL=http://localhost:3000` eklendi
- ✅ `.gitignore`'da olduğu için git'e gitmiyor (`git status` ile teyit edildi)

## Küçük Notlar / Tuzaklar (tekrar yaşamamak için)

- Klasör adında **boşluk veya büyük harf olmasın** (`Training with DOBY` → `training-with-doby` yapıldı, npm buna izin vermiyor)
- `create-next-app` kendiliğinden `AGENTS.md` ve `CLAUDE.md` dosyaları oluşturdu (Next.js'in kendi ajan uyarı dosyaları) — bunlara dokunulmadı, `.cursorrules` ile çakışmıyor
- Dosyaları tarayıcıdan tek tek indirince hepsi `SKILL.md`, `SKILL-2.md` gibi numaralanmış isimlerle iniyor — hangisinin hangi skill olduğunu `grep "^name:"` ile (frontmatter'dan) ayırt ettik
- GitHub artık şifre ile push kabul etmiyor — `gh auth login` (GitHub CLI, `brew install gh` ile kurulur) ile çözüldü
- Git commit kimliği (`user.name`/`user.email`) gerçek bilgilerle ayarlanmalı, örnek metin olduğu gibi bırakılmamalı
- `npm audit fix --force` çalıştırılmadı (bilinçli — `--force` yasak listede); 2 moderate güvenlik uyarısı şu an göz ardı edildi, ileride tekrar değerlendirilebilir
- Cursor'ın mod dropdown'ında "Agent" ismi görünmedi — bunun yerine **Multitask** modu (ya da `Cmd+I` kısayolu) gerçek kod yazma/dosya oluşturma işini yapıyor. "Ask" sadece cevap veriyor, dosya oluşturmuyor.
- Supabase'de yeni proje kurarken "expose new tables" kapalı seçilirse, her tabloya `grant ... to authenticated;` ile elle izin vermek gerekiyor — yoksa RLS doğru olsa bile "permission denied" hatası alınıyor
- Supabase'de anonim giriş (`signInAnonymously`) varsayılan kapalı geliyor, Authentication ayarlarından açılması gerekiyor
- **Cursor ücretsiz planında agent (Multitask) isteği kotası var** — 17 Temmuz'da doldu, 2 gün sonra yenileniyormuş. Kota dolduğunda kod değişiklikleri Claude'un chat'te verdiği kodu Cursor'ın normal (agent olmayan) dosya editöründe elle yapıştırarak da yapılabiliyor — ücretsiz, kotayı etkilemiyor

## Kullanılan Araçlar

- **Editör/Agent:** Cursor (ücretsiz plan), kod yazma işleri **Multitask** modunda yapılıyor
- **Terminal:** Mac Terminal (Cursor içinden veya bağımsız)
- **Git kimlik doğrulama:** GitHub CLI (`gh`)
- **Bu sohbetteki Strava erişimi:** MCP bağlantısı üzerinden (uygulamanın kendi OAuth'undan bağımsız, sadece analiz/sohbet amaçlı) — uygulamanın kendi kullanıcıları için ayrı bir OAuth akışı da artık çalışıyor (bkz. Faz 2)
