# Go-live guide / 上線指南

The site builds to **100% static files** in `dist/` — any static host works, most are free.
All routes are hash-based (`#/browse`), so **no server config, no rewrites, no redirects** needed.

## 0. Build

```bash
pnpm build      # → dist/
pnpm preview    # optional: sanity-check the production build locally
```

## Option A — Cloudflare Pages (recommended: free, fast in HK/Asia, ~2 min)

1. Go to https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Upload assets**
2. Drag the `dist/` folder in.
3. Done — you get a `*.pages.dev` URL. Add your own domain later in the same project.
4. Later: connect the folder to a GitHub repo for drag-free deploys.

(You already have `cloudflared` on this Mac — that's for *tunnels*, a different thing;
Pages upload is simpler for a static site.)

## Option B — Netlify Drop (fastest possible, ~1 min)

1. Go to https://app.netlify.com/drop
2. Drag `dist/` onto the page. Instant `*.netlify.app` URL.

## Option C — Vercel

```bash
npm i -g vercel
vercel dist --prod
```

## Option D — GitHub Pages

```bash
cd dist
git init && git add -A && git commit -m "deploy"
git push to a repo, enable Pages on the branch
```
(Works as-is because routing is hash-based — no 404 hack needed.)

## Before you announce it — checklist

- [x] Domain: **hkadopt.com** (Cloudflare Registrar).
- [ ] Create `info@hkadopt.com` via Zoho Mail free plan (EMAIL-SETUP.md), then the About-page contact is live.
- [ ] Re-run the data snapshot when you ship: refresh `src/data/listings.ts` (names/links) and bump `SNAPSHOT` — takes ~10 min and keeps the site honest.
- [ ] Optional but wise: an "About / 資料來源" link already exists; consider adding a simple privacy note (the site stores everything locally, nothing is collected).
- [ ] Keep a copy of `dist/` or push the repo to GitHub as backup.

## Keeping listings fresh (automated daily 🔄)

`pnpm refresh` re-scrapes HKDR + LAP + HKAAC + SPCA + SAA and rewrites
`src/data/listings.ts` with today's snapshot date. Three ways to schedule it:

### Option 1 — GitHub Actions (recommended, fully automatic)

The repo includes `.github/workflows/refresh.yml`. Once this repo is on GitHub:

1. Push the repo to GitHub.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Done — every day at 08:00 HKT it refreshes data, commits the diff, rebuilds and
   redeploys the site. (You can also trigger it manually: Actions → Daily refresh → Run.)

### Option 2 — This Mac via launchd

Save as `~/Library/LaunchAgents/hk.adopt.refresh.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>hk.adopt.refresh</string>
  <key>ProgramArguments</key><array>
    <string>/bin/zsh</string><string>-c</string>
    <string>cd /Users/angellau/hk-adopt-hub &amp;&amp; pnpm refresh &amp;&amp; pnpm build</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>9</integer></dict>
  <key>StandardOutPath</key><string>/tmp/adopt-refresh.log</string>
  <key>StandardErrorPath</key><string>/tmp/adopt-refresh.log</string>
</dict></plist>
```

Enable: `launchctl load ~/Library/LaunchAgents/hk.adopt.refresh.plist`
(Note: this refreshes the local build — you still need hosting that serves this folder,
e.g. a Cloudflare tunnel, or push to GitHub for Option 1.)

### Option 3 — Manual

```bash
pnpm refresh && pnpm build   # then re-upload dist/ to your host
```

The snapshot date shown on the site updates automatically. If any source breaks,
the script refuses to overwrite the last good data and exits non-zero (CI goes red).
