// On desktop, swap tel: button labels (e.g. "Direct Hulp") for the actual
// phone number so visitors can see and dial it. The links stay fully
// functional clickable tel: links — index.js still fires the conversion.
// Mobile is left untouched so the CTA copy stays action-oriented there.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var DISPLAY_NUMBER = '085 0041138';

  function showNumber() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      // Already showing the number — leave it alone.
      if (link.textContent.indexOf('085') !== -1) return;

      // Replace the label text only; keep the icon span and the href intact.
      Array.from(link.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
      });
      link.appendChild(document.createTextNode(' ' + DISPLAY_NUMBER));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showNumber);
  } else {
    showNumber();
  }
})();
