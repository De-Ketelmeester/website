// ============ GOOGLE CONSENT MODE V2 ============
// This script MUST load before GTM

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent to denied
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

// Check if user already made a choice
(function () {
  var match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  var consent = match ? decodeURIComponent(match[1]) : null;

  if (consent === 'granted') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  }

  // Show banner when DOM is ready if no choice was made yet
  if (!consent) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
      showConsentBanner();
    }
  }
})();

function showConsentBanner() {
  var banner = document.getElementById('consentBanner');
  if (!banner) return;
  // Keep the mobile sticky call bar tappable: stack the banner on top of it
  var bar = document.querySelector('.mobile-sticky-bar');
  if (bar && getComputedStyle(bar).display !== 'none') {
    banner.style.bottom = bar.offsetHeight + 'px';
  }
  banner.classList.add('visible');
}

function acceptCookies() {
  setConsentCookie('granted');
  gtag('consent', 'update', {
    'analytics_storage': 'granted',
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  });
  signalQooqieConsent(true);
  hideConsentBanner();
}

function declineCookies() {
  setConsentCookie('denied');
  signalQooqieConsent(false);
  hideConsentBanner();
}

function setConsentCookie(value) {
  var expires = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = 'cookie_consent=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; secure; samesite=lax';
}

function hideConsentBanner() {
  var banner = document.getElementById('consentBanner');
  if (banner) {
    banner.classList.remove('visible');
    banner.classList.add('hiding');
  }
}

function signalQooqieConsent(granted) {
  // Qooqie consent hook. If Qooqie reads Google Consent Mode v2 from the
  // dataLayer, the gtag('consent','update') calls above already cover it and
  // this stays a no-op. Fill in per the Qooqie dashboard docs if it exposes
  // its own consent API. Number swap and call counting run regardless of
  // consent; only gclid/session linkage is consent-gated (Qooqie-side config).
}
