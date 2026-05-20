# De Ketelmeester — Conversion Tracking

**Goal:** GTM-fired Google Ads conversion tags as **primary** measurement, GA4 imports as **secondary**.

**Current state (2026-05-14):** GTM conversion tracking live and recording. Conversions confirmed working in Google Ads, GA4 events firing in Realtime overview, GA4 secondary imports still flowing. Server-side `UploadClickConversions` code fully removed from the codebase. Desktop phone clicks split off into `generate_phone_lead_desktop` / `phone_lead_desktop` — GTM trigger + tags built, container published, verified working.

---

## Architecture decisions

- **Tracking method:** GTM-fired Google Ads Conversion Tracking tags (instant, no server dependency).
- **Previous approach (abandoned):** Server-side `UploadClickConversions` via PHP was blocked by missing cURL on production. Replaced by GTM-based tracking which requires no server-side dependencies.
- **MCC ↔ operating account:** `9192632141` (JFC Marketing MCC) ↔ `2346371449` (De Ketelmeester).
- **GA4 / Google Ads IDs:** GA4 measurement `G-98S17DS5T9`, Google Ads `AW-18009358897`.
- **Consent Mode v2:** Defaults loaded before GTM in `consent.js`. All GTM tags respect consent settings automatically.

---

## GTM Container: GTM-MPDPCSH4

### Tags

| Tag | Type | ID/Config | Trigger |
|---|---|---|---|
| Google Ads Config | Google Tag | `AW-18009358897` | Initialization - All Pages |
| GA4 Config | Google Tag | `G-98S17DS5T9` | Initialization - All Pages |
| Ads Conversion Linker | Conversion Linker | — | All Pages |
| Ads - Phone Lead | Google Ads Conversion Tracking | ID: `18009358897` / Label: `KoibCJX-j6kcELGExItD` | Phone Lead Event |
| Ads - Phone Lead Desktop | Google Ads Conversion Tracking | ID: `18009358897` / Label: `uJnvCLS_8qwcELGExItD` | Phone Lead Desktop Event |
| Ads - WhatsApp Lead | Google Ads Conversion Tracking | ID: `18009358897` / Label: `oWI-CJj-j6kcELGExItD` | Whatsapp Lead Event |
| Ads - Form Lead | Google Ads Conversion Tracking | ID: `18009358897` / Label: `rF4zCJv-j6kcELGExItD` | Form Lead Event |
| GA4 - Phone Lead | GA4 Event | `G-98S17DS5T9` / event: `generate_phone_lead` | Phone Lead Event |
| GA4 - Phone Lead Desktop | GA4 Event | `G-98S17DS5T9` / event: `generate_phone_lead_desktop` | Phone Lead Desktop Event |
| GA4 - WhatsApp Lead | GA4 Event | `G-98S17DS5T9` / event: `generate_whatsapp_lead` | Whatsapp Lead Event |
| GA4 - Form Lead | GA4 Event | `G-98S17DS5T9` / event: `generate_form_lead` | Form Lead Event |

### Triggers

| Trigger | Type | Event name |
|---|---|---|
| Phone Lead Event | Custom Event | `generate_phone_lead` |
| Phone Lead Desktop Event | Custom Event | `generate_phone_lead_desktop` |
| Whatsapp Lead Event | Custom Event | `generate_whatsapp_lead` |
| Form Lead Event | Custom Event | `generate_form_lead` |

---

## Google Ads Conversion Actions

### Primary (GTM-fired, Website type)

| Name | Conversion ID | Conversion Label | Value | Count | Attribution |
|---|---|---|---|---|---|
| `phone_lead` | 18009358897 | `KoibCJX-j6kcELGExItD` | €50 | One | Data-driven |
| `phone_lead_desktop` | 18009358897 | `uJnvCLS_8qwcELGExItD` | €10 (lower — intent, not a confirmed call) | One | Data-driven |
| `whatsapp_lead` | 18009358897 | `oWI-CJj-j6kcELGExItD` | €50 | One | Data-driven |
| `form_lead` | 18009358897 | `rF4zCJv-j6kcELGExItD` | €50 | One | Data-driven |

> **Desktop phone clicks:** `assets/scripts/index.js` fires `generate_phone_lead_desktop` instead of `generate_phone_lead` when the device is not mobile. A desktop `tel:` click is an intent signal, not a confirmed call — keep it as a lower-value action, or set it to **Secondary** if it adds noise to Smart Bidding. On all 22 pages with a call CTA, `assets/scripts/desktop-call-display.js` swaps the `tel:` button label for the visible phone number on desktop only (links stay clickable; mobile CTA copy unchanged).

### Secondary (GA4 imports, for comparison — delete after 30 days)

| Name | Source | Status |
|---|---|---|
| `generate_phone_lead` | GA4 import | Secondary |
| `generate_whatsapp_lead` | GA4 import | Secondary |
| `generate_form_lead` | GA4 import | Secondary |

### Deleted / deprecated

| Name | Reason |
|---|---|
| `lead_call_click_api` | Server-side API approach abandoned (cURL blocker) |
| `lead_whatsapp_click_api` | Same |
| `lead_form_submit_api` | Same |
| `form_lead_tag` | Created as Import type, incompatible with GTM |

---

## Completed

- [x] Consent Mode v2 + banner on all pages (`assets/scripts/consent.js`, `assets/css/consent.css`)
- [x] Consent defaults loaded before GTM in every `<head>`
- [x] GTM container `GTM-MPDPCSH4` on all 27 pages
- [x] gclid / wbraid / gbraid URL param capture in `assets/scripts/index.js` (90-day cookie)
- [x] Hidden `gclid` / `wbraid` / `gbraid` inputs added to forms
- [x] dataLayer events firing: `generate_phone_lead`, `generate_whatsapp_lead`, `generate_form_lead`
- [x] 300ms delay on tel: and WhatsApp clicks to allow GTM to fire
- [x] Google Ads Config tag in GTM (`AW-18009358897`)
- [x] Conversion Linker tag in GTM (all pages)
- [x] 3 Website-type conversion actions created in Google Ads (2026-05-07)
- [x] 3 Google Ads Conversion Tracking tags in GTM with correct labels
- [x] 3 GA4 Event tags in GTM (to feed GA4 secondary conversions)
- [x] GA4 imports demoted to Secondary in Google Ads
- [x] GA4 re-linked to Google Ads
- [x] GTM container published
- [x] Non-existent landing page URLs removed from Google Ads campaigns (`cv-installatie.html`, `cv-installateur`)

---

## Remaining

### Verified (2026-05-10)
- [x] Google Ads → Goals → Conversions: primary actions recording
- [x] GA4 → Realtime: events appearing on triggers
- [x] GA4 secondary imports still receiving data

### Server-side cleanup (done 2026-05-10)
- [x] Deleted `api/google-ads-uploader.php`
- [x] Deleted `api/env.php`
- [x] Deleted `api/.env` and `api/.env.example` (local)
- [x] Removed `uploadClickConversion()` block from `api/log-call.php`
- [x] Removed `uploadClickConversion()` block from `offerte.php`
- [x] Removed `uploadClickConversion()` block from `contact.php`

### Desktop phone lead — wire-up (after 2026-05-14 code change)
- [x] **Google Ads:** create `phone_lead_desktop` conversion action — label `uJnvCLS_8qwcELGExItD`
- [x] **GTM:** add `Phone Lead Desktop Event` Custom Event trigger (`generate_phone_lead_desktop`)
- [x] **GTM:** add `Ads - Phone Lead Desktop` conversion tag with the new label
- [x] **GTM:** add `GA4 - Phone Lead Desktop` event tag
- [x] **GTM:** publish container (2026-05-14)
- [x] Verify in GTM Preview that desktop `tel:` clicks fire `generate_phone_lead_desktop` and mobile still fires `generate_phone_lead`

### Still to do (manual — Google UIs / production)
- [ ] **Delete Import-type conversion actions in Google Ads:** `lead_call_click_api`, `lead_whatsapp_click_api`, `lead_form_submit_api`, `form_lead_tag`
- [ ] **Delete secondary GA4 imports** on/after **2026-06-07** (30-day comparison window)
- [ ] **Revoke OAuth credentials** in Google Cloud Console (no longer needed)
- [ ] **Delete `api/.env` on production VPS** (e.g. `rm /var/www/deketelmeester.nl/api/.env`)
- [ ] Optional: also delete `logs/gads-uploads.log` on prod if it exists

---

## File reference

| Path | Purpose |
|---|---|
| `assets/scripts/index.js` | gclid capture, dataLayer events (mobile vs desktop phone split), hidden field population |
| `assets/scripts/desktop-call-display.js` | Desktop-only: swaps `tel:` button labels for the visible phone number (all 22 call-CTA pages) |
| `assets/scripts/consent.js` | Consent Mode v2 defaults + banner control |
| `assets/css/consent.css` | Banner styling |
| `bedankt.html` | Fires `generate_form_lead` dataLayer event on page load |
| `api/log-call.php` | Email + log call/WhatsApp click events (server-side notification only) |
| `offerte.php` | Form handler, writes to `offertes.txt`, redirects to `bedankt.html` |
| `contact.php` | Alternative form handler, writes to `messages.txt` |

---

## Out of scope / not pursued

- **Server-side UploadClickConversions** — abandoned 2026-05-07. PHP cURL was never enabled on production. GTM-based tracking provides the same result without server dependencies.
- **Database-backed lead queue** — not needed with GTM approach.
- **Enhanced Conversions for Leads (ECL)** — future work. Can be enabled in GTM by passing hashed email/phone in the conversion tag. Lifts match rate for form leads with missing GCLIDs.
- **Offline conversion import for closed deals** — future. Upload `lead_won` when a lead pays, so bidding optimizes for revenue.
