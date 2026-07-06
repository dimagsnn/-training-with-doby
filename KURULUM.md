# KURULUM.md — Faz 1: Temel İskelet

Bu dosya, `Surec_ve_Mimari_Dokumani.docx`'te tanımlanan Faz 1 kapsamını Cursor'da adım adım uygulamak için hazırlanmıştır. Cursor agent moduna bu dosyayı gösterip "bunu adım adım uygula" diyerek başlayabilirsin.

> Uygulamadan önce: `.cursorrules` dosyasının repo kök dizininde olduğundan emin ol — Cursor agent'ı her adımdan önce bunu okumalı.

## 0. Ön Koşullar

- [ ] Node.js kurulu (LTS sürüm)
- [ ] GitHub hesabı hazır
- [ ] Supabase hesabı hazır (supabase.com)
- [ ] Vercel hesabı hazır (vercel.com)
- [ ] Cursor'da bu proje için boş bir klasör açık

## 1. Repo İskeleti

```bash
npx create-next-app@latest antrenman-asistani --typescript --tailwind --app --eslint
cd antrenman-asistani
git init
git add .
git commit -m "chore: initial Next.js scaffold"
```

- [ ] GitHub'da boş bir repo oluştur (README'siz)
- [ ] Lokal repo'yu bağla:
```bash
git remote add origin <REPO_URL>
git branch -M main
git push -u origin main
```

## 2. Klasör Yapısı

```
antrenman-asistani/
├── .cursorrules                  ← yasak komutlar + SKILL.md referansları
├── KURULUM.md                    ← bu dosya
├── skills/
│   ├── training-principles/SKILL.md
│   ├── goal-assessment/SKILL.md
│   ├── revision-logic/SKILL.md
│   └── heat-and-recovery/SKILL.md
├── docs/
│   └── Surec_ve_Mimari_Dokumani.docx
├── app/                          ← Next.js app router
├── lib/
│   ├── supabase/                 ← Supabase client + tip tanımları
│   └── strava/                   ← Strava API yardımcıları
└── .env.local                    ← (git'e eklenmez)
```

- [ ] `skills/` klasörünü oluştur, 4 SKILL.md dosyasını içine kopyala
- [ ] `docs/` klasörünü oluştur, mimari dokümanını içine kopyala
- [ ] `.gitignore`'a `.env.local` satırının olduğunu doğrula (create-next-app zaten ekler)

## 3. Supabase Kurulumu

- [ ] Supabase Dashboard'da yeni proje oluştur
- [ ] `lib/supabase/client.ts` ve `lib/supabase/server.ts` dosyalarını Supabase JS SDK ile kur
- [ ] Mimari dokümanındaki veri modeline göre tabloları oluştur (Supabase SQL Editor'de, **elle çalıştır**, agent'a otomatik çalıştırtma):
  - `users`, `strava_connections`, `goals`, `training_frequency`, `plans`, `activities_cache`, `revisions`
- [ ] `.env.local`'e ekle:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> Not: Migration dosyaları oluşturulabilir ve `supabase db push` **ilk kurulumda, linksiz bir local/dev projede** çalıştırılabilir. `--linked` bir production projeye karşı asla otomatik çalıştırılmaz — bkz. `.cursorrules`.

## 4. Strava OAuth Bağlantısı

- [ ] Strava API uygulaması oluştur (strava.com/settings/api)
- [ ] `.env.local`'e ekle:
```
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
```
- [ ] `app/api/strava/callback/route.ts` — OAuth callback handler
- [ ] Token'ları `strava_connections` tablosuna kaydeden fonksiyon

## 5. GitHub → Vercel Bağlantısı

- [ ] Vercel Dashboard'dan "Import Project" ile GitHub repo'yu bağla (bu, CLI değil dashboard üzerinden yapılır)
- [ ] Environment variable'ları Vercel Dashboard'a manuel gir (Supabase + Strava anahtarları)
- [ ] İlk deploy'un Vercel Dashboard üzerinden otomatik tetiklendiğini doğrula (main branch push sonrası)

> Not: Vercel CLI ile deploy (`vercel --prod` / `vercel deploy`) bu projede kullanılmıyor — deploy her zaman GitHub push → Vercel otomatik build akışıyla olur. Bkz. `.cursorrules`.

## 6. Doğrulama

- [ ] `npm run build` lokal olarak hatasız çalışıyor
- [ ] `npm run lint` ve `tsc --noEmit` temiz
- [ ] Vercel'deki production URL açılıyor
- [ ] Supabase tabloları Dashboard'dan görünüyor
- [ ] Strava OAuth akışı test kullanıcısıyla çalışıyor

## Sıradaki Faz

Faz 1 tamamlandığında Faz 2'ye (Strava senkronizasyonu + analiz özeti) geçilir — bkz. `docs/Surec_ve_Mimari_Dokumani.docx` §5.
