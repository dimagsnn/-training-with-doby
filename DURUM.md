# DURUM.md — Proje Durumu (6 Temmuz 2026 itibarıyla)

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

## Bilinçli Olarak Ertelenenler / Henüz Yapılmayanlar

- ❌ **Vercel'e bağlanmadı** — bilinçli olarak erteledik, çünkü şu an sadece varsayılan "Welcome to Next.js" sayfası deploy edilir, test edilebilir bir şey yok. Supabase + Strava OAuth + en az bir gerçek sayfa olmadan Vercel adımı anlamsız.
- ✅ **Supabase projesi oluşturuldu ve şema kuruldu** (bkz. yukarıdaki "Supabase Şeması" bölümü)
- ❌ **Strava OAuth (uygulamanın kendi bağlantısı) henüz kurulmadı** — not: bu, şu an Claude'un bu sohbette kullandığı Strava MCP bağlantısından farklı; uygulamanın kendi kullanıcılarının kendi Strava hesaplarını bağlayabilmesi için ayrı bir OAuth akışı gerekiyor
- ❌ Hiçbir sayfa/route yazılmadı henüz

## Bir Sonraki Adımlar (öncelik sırasıyla)

1. ⏭️ **BURADAN DEVAM: Strava API uygulaması oluştur** — strava.com/settings/api adresine git, "Training with DOBY" adıyla bir uygulama oluştur, Authorization Callback Domain'e `localhost` yaz. Client ID ve Client Secret'ı `.env.local`'e ekle (`>>` ile, üzerine yazmadan):
   ```bash
   cat >> .env.local << 'EOF'
   STRAVA_CLIENT_ID=buraya_client_id
   STRAVA_CLIENT_SECRET=buraya_client_secret
   EOF
   ```
2. Basit bir ilk sayfa yaz: "Strava'ya bağlan" butonu + son aktiviteleri listeleyen görünüm (ilk gerçek test edilebilir özellik)
3. Ancak bundan sonra Vercel'e bağlan ve gerçek bir deploy test et
4. Daha sonra: takvim görünümü (Faz 6) — planned_workouts ile activities_cache eşleştirmesi, planlanan/gerçekleşen çizgi grafiği

## `.env.local` Durumu (7 Temmuz 2026 itibarıyla)

- ✅ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key) dolduruldu ve doğrulandı
- ✅ `.gitignore`'da olduğu için git'e gitmiyor (`git status` ile teyit edildi)
- ❌ `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` henüz eklenmedi — yarın buradan devam

## Küçük Notlar / Tuzaklar (tekrar yaşamamak için)

- Klasör adında **boşluk veya büyük harf olmasın** (`Training with DOBY` → `training-with-doby` yapıldı, npm buna izin vermiyor)
- `create-next-app` kendiliğinden `AGENTS.md` ve `CLAUDE.md` dosyaları oluşturdu (Next.js'in kendi ajan uyarı dosyaları) — bunlara dokunulmadı, `.cursorrules` ile çakışmıyor
- Dosyaları tarayıcıdan tek tek indirince hepsi `SKILL.md`, `SKILL-2.md` gibi numaralanmış isimlerle iniyor — hangisinin hangi skill olduğunu `grep "^name:"` ile (frontmatter'dan) ayırt ettik
- GitHub artık şifre ile push kabul etmiyor — `gh auth login` (GitHub CLI, `brew install gh` ile kurulur) ile çözüldü
- Git commit kimliği (`user.name`/`user.email`) gerçek bilgilerle ayarlanmalı, örnek metin olduğu gibi bırakılmamalı
- `npm audit fix --force` çalıştırılmadı (bilinçli — `--force` yasak listede); 2 moderate güvenlik uyarısı şu an göz ardı edildi, ileride tekrar değerlendirilebilir

## Kullanılan Araçlar

- **Editör/Agent:** Cursor (ücretsiz plan)
- **Terminal:** Mac Terminal (Cursor içinden veya bağımsız)
- **Git kimlik doğrulama:** GitHub CLI (`gh`)
- **Bu sohbetteki Strava erişimi:** MCP bağlantısı üzerinden (uygulamanın kendi OAuth'undan bağımsız, sadece analiz/sohbet amaçlı)
