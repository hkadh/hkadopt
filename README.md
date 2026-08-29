# 領養一站通 · HK Adopt Hub

> 香港狗貓領養一站化平台 — 聚合真實領養個案，一鍵直達機構官網申請
> One hub for every HK dog & cat adoption listing — straight to the source.

## The model

This is an **aggregator / directory**, not a middleman:

1. **Aggregate** — real, current adoption cases from Hong Kong organisations' public
   websites, with a snapshot date and a source link on every card.
2. **Direct** — every case and organisation links **directly to the org's own site**,
   where the live status, photos, story and application form live. We never stand
   between adopter and organisation, and all case content remains the orgs' copyright.
3. **One profile, reused everywhere** — the adopter fills one profile and can copy a
   standard **application summary** to paste into any org's form or email. No more
   re-typing the same answers a dozen times.

Goal: lower the cost of finding and applying → faster matching → **more pets adopted**. 🐾

## What's inside (all verified 2026-08-28)

- **9 real organisations** (救狗之家 HKDR · 保護動物慈善協會 LAP · SPCA · 保護遺棄動物協會 SAA ·
  香港動物領養中心 HKAAC · 香港動物基金 HK Paws Foundation · 浪浪之家 HFHD ·
  漁護署 AFCD · TAILS Lantau) with deep links, application forms, contacts and visiting
  hours — plus a **「更多領養渠道」directory** on the Orgs page: 12 further rescues
  reachable in one tap (大樹下 Big Tree, 毛守救援 PGRS, No Dogs Left Behind, 阿棍屋,
  香港拯救貓狗協會 HKSCDA, KirstensZoo, 西貢流浪之友 Sai Kung Stray Friends, Paws United, Regina Paws,
  Mongrels Family, 香港後巷貓 Alley Cat Watch, Lamma Animals, 香港兔協會, HKHERP) — covering
  bot-protected sites, Instagram-based foster networks, and rabbit/reptile rescues
  that can't be auto-indexed.
- **685 real adoption cases with real photos** (auto-refreshed daily): 24 HKDR dogs +
  61 LAP dogs + 90 LAP cats + 30 HKAAC animals + 126 SPCA animals + 126 SAA animals
  (status-filtered nightly) + 65 HK Paws Foundation animals (full breed/DOB/gender/
  neutered/vaccinated data from their Webflow CMS) + 41 浪浪之家 HFHD animals
  (gender/age/status from their Wix CMS, adopted animals dropped nightly) + 122
  毛守救援 PGRS animals (name/breed/gender/age/status from their WordPress
  pet-listing, adopted animals dropped nightly). Photos are **hotlinked live from the
  organisations' own servers** (never rehosted), credited on-card, and fall back
  to a neutral avatar if an image ever breaks. Every card links to the animal's
  own page.
- **Rich filters** — type, organisation, gender, **age** (exact months parsed from
  listings/DOBs, bucketed 幼年/少年/成年/年長), **size**, **breed** + search,
  **sorting** (youngest/oldest/name), **favourites-only view**, **share** (Web
  Share API + clipboard fallback).


## Daily refresh 🔄

`pnpm refresh` re-scrapes HKDR + LAP + HKAAC + SPCA and rewrites
`src/data/listings.ts` with a new snapshot date. Three ways to run it:

1. **GitHub Actions (recommended)** — `.github/workflows/refresh.yml` runs daily at
   08:00 HKT: refreshes data, commits changes, rebuilds and deploys to GitHub Pages.
   Just push this repo to GitHub and enable Pages.
2. **Mac launchd** — see DEPLOY.md for a ready-made plist that runs the refresh daily.
3. **Manual** — run `pnpm refresh && pnpm build` whenever you like.

If a source's page structure changes or a fetch fails, the script refuses to write and
keeps the last good snapshot (fails loudly in CI).
- **繁體中文 first** (zh-Hant-HK default) · English switch in Settings + header 繁/EN toggle.
- Adopter profile → one-click **copy application summary** (paste into any org form).
- Manual **application tracker** (per-case status: submitted → review → meet → adopted).
- Favourites ❤️, filters (type/org/search), localStorage only — no accounts, no backend.

## Quick start

```bash
pnpm install
pnpm dev        # → http://localhost:5173
```

Production build: `pnpm build` → static site in `dist/` (hash routing → hostable anywhere).
See **DEPLOY.md** for go-live options.

## Honest limitations

- Indexed cases (HKDR / LAP / HKAAC / SPCA / SAA / HK Paws / HFHD) refresh daily via the scraper —
  ages are recomputed from DOBs each run, so they stay exact. Cases get adopted
  fast; the org's page is always the source of truth (every card links to it +
  shows the snapshot date).
- **TAILS Lantau** (Wix) only exposes animal names inside private renderer JSON →
  application channel. Several small rescues are hard to automate from a server:
  **KirstensZoo** sits behind a bot challenge, **HKPAWS / Home For Homeless Dog**
  are Wix JS galleries, **HKSCDA** is a JS app. Automating these needs official
  feeds — the Phase-2 partnership ask.
- Contact: `info@hkadopt.com` (Zoho Mail on hkadopt.com — see EMAIL-SETUP.md).
## Tech

- **Vite + React 18 + TypeScript** — no other runtime dependencies
- Hash routing → deploys as static files anywhere (Netlify/Vercel/Cloudflare/GitHub Pages)
- i18n dictionaries: `src/dict.ts`（繁中）/ `src/dict-en.ts`（English）
- Data: `src/data/orgs.ts` (real orgs) + `src/data/listings.ts` (real cases, snapshot-dated)
- localStorage store: `src/store.tsx`
- Dev smoke test: `node scripts/ssr-check.mjs` (renders every route in both languages)

```
src/
  data/orgs.ts      real orgs + verified deep links
  data/listings.ts  real adoption cases (snapshot 2026-08-28)
  pages/            Home, Browse, Orgs, Profile, Applications, Settings, About
  components/       header/footer, ListingCard, avatars, status badge
scripts/
  ssr-check.mjs     route smoke test (zh + en)
```
