# Landing Pages — Performance & Quality Score

**Goal:** Maximize Google Ads Quality Score on the 3 ad pages (`cv-storing`, `cv-monteur-hilversum`, `geen-warm-water`) by improving Core Web Vitals + landing-page experience signals.

**Latest baseline (PSI mobile, cv-storing, 2026-05-11 09:27):**
- Performance: **81 / 100** | A11y: 93 | BP: 100 | SEO: 100
- LCP: 2.7 s (just over 2.5 s threshold) | FCP: 1.7 s | TBT: **540 ms** ← only meaningful gap | CLS: 0 ✅ | SI: 2.6 s ✅
- Component scores: FCP 9/10, LCP 21/25, **TBT 16/30**, CLS 25/25, SI 10/10
- Decision (2026-05-11): stop chasing perf for now. 81 is "Good" range for Quality Score; gains from here are diminishing returns vs effort.

**Score timeline:**
- 2026-05-10 baseline: 70 (LCP 5.6s, TBT 250ms)
- 2026-05-11 09:13 (after font self-host + GTM-to-body-end): 59 ⬇ — GTM move backfired, shifted cost from LCP to TBT
- 2026-05-11 09:27 (after GTM-revert-with-requestIdleCallback + mobile fade-up disable): **81** ⬆

---

## ⏭ Next session — start here

### 1. Pull PSI for the 5 remaining page/device combos
Only have cv-storing mobile so far. Still missing:
- [ ] cv-storing desktop
- [ ] cv-monteur-hilversum mobile + desktop
- [ ] geen-warm-water mobile + desktop

Expected: desktop scores should all be 90+ since render-blocking matters less on fast connections. Hilversum mobile may be slightly lower (3rd-party Google Maps embed adds load).

If any page is unexpectedly low, dig in. Otherwise file under "good enough."

Easiest path: paste numbers manually into chat, OR get a free PSI API key at https://console.cloud.google.com/apis/credentials.

---

## 🟡 Medium-effort wins (skipped 2026-05-11, available if you want to push 81 → 90+)

PSI still flags these on cv-storing mobile at 81 score:

### 2. Identify + preload the LCP image (+3-5 points, ~10 min)
LCP is 2.7 s — just over the 2.5 s threshold. Identifying the LCP element from the PSI report and adding `<link rel="preload" as="image" fetchpriority="high">` for it would likely tip into "Good" range. Need to read the LCP element from a fresh report.

### 3. Cache headers on static assets (Quality Score signal, no first-load lift)
PSI flagged 238 KiB savings. Add to `.htaccess` on prod:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```
(Need to confirm web server is Apache. If nginx, different config.)

### 4. Render-blocking CSS (-600 ms in PSI, +3-5 points)
`main.css` + `landing.css` are large and load synchronously. Two options:
- **Easy:** swap to `media="print" onload="this.media='all'"` trick to async-load. Risk: brief FOUC.
- **Hard:** extract critical above-the-fold CSS into inline `<style>` in head, async-load the rest. ~5-8 KB of CSS to identify by hand.

### 5. Responsive images via `srcset` (-40 KiB, +1-2 points)
Hero images load full-size on mobile. Generate 400w/800w/1200w variants of `ketelmeesterwerklandscape.webp` (92 KB), `cvk.webp` (64 KB), `cvinsta.webp` (56 KB) — then add `srcset` + `sizes` to img tags.

### 6. Fix the 2 a11y issues (93 → 100)
- [ ] **Contrast ratio insufficient** — find which element. Likely a light-grey-on-white or yellow-on-white case. Need to hover the report's "Contrast" item to identify.
- [ ] **`<li>` outside `<ul>/<ol>/<menu>`** — find the stray `<li>`. Probably in the consent banner or sticky nav.

### 7. Non-composited animations (2 found by PSI)
PSI still flags 2 elements with non-compositor-safe animations. Likely the `heroFadeUp` keyframes or another animation outside `.fade-up`. Switch to `transform` + `opacity` only. Cosmetic improvement, doesn't move PSI score much.

### 8. Reduce form-field count on landing pages
Modal form on cv-storing has 5 fields + service dropdown. For "spoed" (urgency) intent, drop to **Name + Phone only**. Higher conversion rate signal. UX/conversion behavior change — A/B decide before shipping.

### 9. DOM-size optimization
PSI flagged DOM size. Hard to fix without removing content (FAQ, accordions, schemas). Skip unless stuck below 85.

---

## 📋 Already done

### 2026-05-10
- ✅ Self-host Montserrat (variable woff2, latin + latin-ext subsets) — eliminates fonts.googleapis.com round-trip
- ✅ Logo `loading="eager" fetchpriority="high"` site-wide (22 files)
- ✅ Logo preload `<link>` on 3 ad pages
- ✅ Fix missing canonical on `cv-storingscodes.html`
- ✅ Fix wrong `og:url` on `bedankt.html` (was `/storingen`)
- ✅ Embed Google Map on `cv-monteur-hilversum.html` (Prinsenstraat 36, Hilversum)
- ✅ Hero H2 → "Wij helpen direct." on cv-monteur-hilversum + geen-warm-water
- ✅ Hero subtitle on geen-warm-water now front-loads "Warm water werkt niet meer?"
- ✅ Strip dead server-side Google Ads upload code (`api/google-ads-uploader.php`, `api/env.php`, `api/.env`, `api/.env.example`, plus blocks in `offerte.php` / `contact.php` / `api/log-call.php`)
- ✅ Verified city-tile chips on cv-monteur-hilversum are inert `<span>`s (not dead anchors as agent claimed)

### 2026-05-11
- ✅ Move GTM `<script>` block to before `</body>` (initial attempt) — backfired, score 70 → 59
- ✅ Revert GTM to head, wrap IIFE in `requestIdleCallback(loadGTM, {timeout: 2500})` with `setTimeout(..., 1500)` fallback — score 59 → 81
- ✅ Disable `.fade-up` and `.hero-split-left` animation on mobile (≤900px) — fixed Speed Index from 7.3 s → 2.6 s
- ✅ Decision: live with the rare missed fast-click conversion (within first ~2.5 s of page load before GTM loads). Mitigated by existing 300 ms tel:/WhatsApp click delay + form submits going through `bedankt.html` which fires its own pageview.

## 📁 File reference

| Path | What's there |
|---|---|
| `assets/fonts/montserrat-latin.woff2` | Self-hosted variable font, 38 KB, weights 400-700 |
| `assets/fonts/montserrat-latin-ext.woff2` | Extended-Latin subset, 70 KB (only fetched if needed via unicode-range) |
| `assets/css/main.css` (top) | `@font-face` declarations |
| `assets/css/landing.css` | Shared CSS for the 3 ad pages |
| `cv-storing.html` / `cv-monteur-hilversum.html` / `geen-warm-water.html` | The 3 ad pages |
| `claude/todo/conversion-tracking.md` | Separate todo for conversion-tracking cleanup |
