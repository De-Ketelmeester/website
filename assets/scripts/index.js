// ============ GCLID CAPTURE (first-touch, 90-day cookie) ============
(function captureClickIds() {
  const params = new URLSearchParams(window.location.search);
  const gclid  = params.get('gclid');
  const wbraid = params.get('wbraid');
  const gbraid = params.get('gbraid');

  if (gclid)  setClickIdCookie('_gads_gclid',  gclid);
  if (wbraid) setClickIdCookie('_gads_wbraid', wbraid);
  if (gbraid) setClickIdCookie('_gads_gbraid', gbraid);
})();

function setClickIdCookie(name, value) {
  const exp = new Date(Date.now() + 90 * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; secure; samesite=lax`;
}

function readClickIdCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function readGclidCookie()  { return readClickIdCookie('_gads_gclid');  }
function readWbraidCookie() { return readClickIdCookie('_gads_wbraid'); }
function readGbraidCookie() { return readClickIdCookie('_gads_gbraid'); }

function attachClickIdsToForms() {
  const gclid  = readGclidCookie() || new URLSearchParams(window.location.search).get('gclid');
  const wbraid = readWbraidCookie() || new URLSearchParams(window.location.search).get('wbraid');
  const gbraid = readGbraidCookie() || new URLSearchParams(window.location.search).get('gbraid');
  if (gclid)  document.querySelectorAll('input[name="gclid"]').forEach(i => i.value = gclid);
  if (wbraid) document.querySelectorAll('input[name="wbraid"]').forEach(i => i.value = wbraid);
  if (gbraid) document.querySelectorAll('input[name="gbraid"]').forEach(i => i.value = gbraid);
}
document.addEventListener('DOMContentLoaded', attachClickIdsToForms);

// ============ SESSION TRACKING ============
const sessionStartTime = new Date();
let pageScrolled = 0;

// Track scroll depth
window.addEventListener('scroll', () => {
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  pageScrolled = Math.max(pageScrolled, Math.round(scrollPercent));
});

// ============ STICKY NAVBAR ============
// Sticky navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

// Hamburger toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobile = document.getElementById('closeMobile');

hamburger.addEventListener('click', () => {
  mobileMenu.style.right = '0';
});

closeMobile.addEventListener('click', () => {
  mobileMenu.style.right = '-100%';
});




function setupClickToggle(targetId, contentId) {
  const target = document.getElementById(targetId);
  const content = document.getElementById(contentId);

  if (!target || !content) return;

  target.addEventListener('click', () => {
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
  });
}

setupClickToggle('dienstenToggle', 'dienstenMenu');
setupClickToggle('regioToggle', 'regioMenu');






document.addEventListener('scroll', () => {
  document.querySelectorAll('.parallax-img').forEach((el) => {
    const speed = 0.2;
    const offset = window.pageYOffset;
    el.style.transform = `translateY(${offset * speed}px)`;
  });
});

const slides = document.querySelectorAll('.testimonial-slide');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');
let current = 0;
let interval = setInterval(nextSlide, 7000); // auto-slide elke 7 sec

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  current = (current + 1) % slides.length;
  showSlide(current);
}

function prevSlide() {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
}

nextBtn?.addEventListener('click', () => {
  nextSlide();
  resetInterval();
});

prevBtn?.addEventListener('click', () => {
  prevSlide();
  resetInterval();
});

function resetInterval() {
  clearInterval(interval);
  interval = setInterval(nextSlide, 7000);
}

// ============ DEVICE DETECTION ============
function isMobileDevice() {
  return /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

// ============ PHONE CONVERSION TRACKING ============
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href^="tel:"]');
  if (link) {
    e.preventDefault();
    var href = link.href;
    logCallClick();
    // Desktop tel: clicks rarely complete a real call, so fire a separate
    // event. It maps to a lower-value Google Ads conversion action than a
    // mobile tap, while still capturing the call intent.
    dataLayer.push({
      event: isMobileDevice() ? 'generate_phone_lead' : 'generate_phone_lead_desktop'
    });
    // Give GTM 300ms to send the conversion request before navigating
    setTimeout(function() { window.location = href; }, 300);
  }
});

// ============ CALL LOGGING FUNCTION ============
function logCallClick() {
  // Calculate session duration in seconds
  const sessionDuration = Math.round((new Date() - sessionStartTime) / 1000);
  
  // Detect device type
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  
  // Get current page URL and service type
  const currentPageUrl = window.location.href;
  const pathSegments = window.location.pathname.split('/');
  let serviceType = 'General';
  if (pathSegments.includes('diensten')) {
    const serviceName = pathSegments[pathSegments.length - 1].replace('.html', '');
    serviceType = serviceName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Get referrer
  const referrer = document.referrer || 'Direct';
  
  // Parse referrer source
  let referrerSource = 'Direct';
  if (referrer) {
    if (referrer.includes('google')) referrerSource = 'Google';
    else if (referrer.includes('facebook')) referrerSource = 'Facebook';
    else if (referrer.includes('instagram')) referrerSource = 'Instagram';
    else if (referrer.includes('linkedin')) referrerSource = 'LinkedIn';
    else if (referrer.includes('trustpilot')) referrerSource = 'Trustpilot';
    else referrerSource = 'Other';
  }
  
  // Timestamp
  const timestamp = new Date().toLocaleString('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Amsterdam'
  });

  // Prepare comprehensive data to send
  const data = {
    userAgent: navigator.userAgent,
    timestamp: timestamp,
    currentPage: currentPageUrl,
    serviceType: serviceType,
    deviceType: deviceType,
    referrer: referrer,
    referrerSource: referrerSource,
    sessionDuration: sessionDuration,
    scrollDepth: pageScrolled,
    gclid: readGclidCookie(),
    wbraid: readWbraidCookie(),
    gbraid: readGbraidCookie(),
    conversionTime: new Date().toISOString(),
    conversionType: 'call'
  };

  // Send to backend
  fetch('/api/log-call.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('Lead logged:', result);
  })
  .catch(error => {
    console.error('Error logging lead:', error);
  });

  // Allow the tel: link to work
  return true;
}

// ============ WHATSAPP CONVERSION TRACKING ============
document.addEventListener('click', function(e) {
  var link = e.target.closest('a.whatsapp-float, a.whatsapp-knop');
  if (link) {
    e.preventDefault();
    var href = link.href;
    logWhatsAppClick();
    dataLayer.push({event: 'generate_whatsapp_lead'});
    // Give GTM 300ms to send the conversion request before opening WhatsApp
    setTimeout(function() { window.open(href, '_blank'); }, 300);
  }
});

// ============ WHATSAPP LOGGING FUNCTION ============
function logWhatsAppClick() {
  const sessionDuration = Math.round((new Date() - sessionStartTime) / 1000);
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  const currentPageUrl = window.location.href;
  const pathSegments = window.location.pathname.split('/');
  let serviceType = 'General';
  if (pathSegments.includes('diensten')) {
    const serviceName = pathSegments[pathSegments.length - 1].replace('.html', '');
    serviceType = serviceName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const referrer = document.referrer || 'Direct';
  let referrerSource = 'Direct';
  if (referrer) {
    if (referrer.includes('google')) referrerSource = 'Google';
    else if (referrer.includes('facebook')) referrerSource = 'Facebook';
    else if (referrer.includes('instagram')) referrerSource = 'Instagram';
    else if (referrer.includes('linkedin')) referrerSource = 'LinkedIn';
    else if (referrer.includes('trustpilot')) referrerSource = 'Trustpilot';
    else referrerSource = 'Other';
  }

  const timestamp = new Date().toLocaleString('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Amsterdam'
  });

  const data = {
    userAgent: navigator.userAgent,
    timestamp: timestamp,
    currentPage: currentPageUrl,
    serviceType: serviceType,
    deviceType: deviceType,
    referrer: referrer,
    referrerSource: referrerSource,
    sessionDuration: sessionDuration,
    scrollDepth: pageScrolled,
    leadType: 'whatsapp',
    gclid: readGclidCookie(),
    wbraid: readWbraidCookie(),
    gbraid: readGbraidCookie(),
    conversionTime: new Date().toISOString(),
    conversionType: 'whatsapp'
  };

  fetch('/api/log-call.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('WhatsApp lead logged:', result);
  })
  .catch(error => {
    console.error('Error logging WhatsApp lead:', error);
  });
}

const count = Math.floor(Math.random() * 8) + 8;
const availabilityEl = document.querySelector('.availability span:not(.dot)');
if (availabilityEl) {
  availabilityEl.innerText = `+${count} monteurs beschikbaar`;
}

// ============ FAQ TOGGLE ============
function toggleFAQ(button) {
  const faqItem = button.closest('.faq-item');
  const answer = faqItem.querySelector('.faq-answer');
  const isOpen = faqItem.classList.contains('active');
  
  // Close all other FAQ items
  document.querySelectorAll('.faq-item').forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('active');
    }
  });
  
  // Toggle current item
  faqItem.classList.toggle('active');
}

// ============ CONTACT MODAL ============
function openModal() {
  const modal = document.getElementById('contactModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent background scroll
  attachClickIdsToForms();
}

function closeModal() {
  const modal = document.getElementById('contactModal');
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restore scroll
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!data.name || !data.phone || !data.email || !data.service) {
        e.preventDefault();
        alert('Vul alstublieft alle verplichte velden in.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        e.preventDefault();
        alert('Voer alstublieft een geldig e-mailadres in.');
        return;
      }

      // Validation passed - form submits normally to offerte.php
      // offerte.php saves the data and redirects to /bedankt.html
    });
  }
});



