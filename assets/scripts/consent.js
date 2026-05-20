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
  if (banner) banner.classList.add('visible');
}

function acceptCookies() {
  setConsentCookie('granted');
  gtag('consent', 'update', {
    'analytics_storage': 'granted',
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  });
  hideConsentBanner();
}

function declineCookies() {
  setConsentCookie('denied');
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
