/* ==========================================================================
   Viraj Hurbada — personal profile site
   Vanilla JS only: nav behaviour, scroll reveal, video-on-visible,
   and a small visitor logger (see the bottom of this file).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Sticky nav background on scroll ---------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile nav toggle ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Fade sections in on scroll ---------------- */
  const revealTargets = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: no IntersectionObserver support, just show everything
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Play cycling videos only while visible ---------------- */
  const videos = document.querySelectorAll('.video-player');

  if ('IntersectionObserver' in window && videos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => { /* autoplay blocked, that's fine */ });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    videos.forEach((video) => videoObserver.observe(video));
  }

  const mediaItems = document.querySelectorAll('main img, main video');
  const mediaViewer = document.createElement('dialog');
  mediaViewer.className = 'media-viewer';
  mediaViewer.innerHTML = `
    <div class="media-viewer-inner">
      <button class="media-viewer-close" type="button" aria-label="Close media viewer">&times;</button>
      <div class="media-viewer-content"></div>
      <p class="media-viewer-status" aria-live="polite"></p>
    </div>
  `;
  document.body.appendChild(mediaViewer);

  const viewerContent = mediaViewer.querySelector('.media-viewer-content');
  const viewerStatus = mediaViewer.querySelector('.media-viewer-status');
  const closeViewer = () => {
    mediaViewer.close();
    viewerContent.replaceChildren();
    viewerStatus.textContent = '';
    document.body.classList.remove('media-viewer-open');
  };

  const openViewer = (media) => {
    const enlargedMedia = media.cloneNode(true);
    enlargedMedia.removeAttribute('loading');
    enlargedMedia.removeAttribute('poster');
    enlargedMedia.controls = media.tagName === 'VIDEO';
    enlargedMedia.autoplay = media.tagName === 'VIDEO';
    enlargedMedia.muted = media.tagName === 'VIDEO';
    enlargedMedia.controlsList = 'nodownload';
    enlargedMedia.addEventListener('contextmenu', (event) => event.preventDefault());
    viewerContent.replaceChildren(enlargedMedia);
    viewerStatus.textContent = '';
    mediaViewer.showModal();
    document.body.classList.add('media-viewer-open');
  };

  mediaItems.forEach((media) => {
    media.setAttribute('tabindex', '0');
    media.setAttribute('role', 'button');
    media.addEventListener('click', () => openViewer(media));
    media.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(media);
      }
    });
    media.addEventListener('contextmenu', (event) => event.preventDefault());
  });

  mediaViewer.querySelector('.media-viewer-close').addEventListener('click', closeViewer);
  mediaViewer.addEventListener('click', (event) => {
    if (event.target === mediaViewer) closeViewer();
  });
  mediaViewer.addEventListener('close', () => {
    viewerContent.replaceChildren();
    document.body.classList.remove('media-viewer-open');
  });

  const flagPossibleCapture = () => {
    if (mediaViewer.open) {
      viewerStatus.textContent = 'Capture activity suspected';
      mediaViewer.classList.add('capture-suspected');
    }
  };

  window.addEventListener('blur', flagPossibleCapture);
  document.addEventListener('visibilitychange', flagPossibleCapture);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'PrintScreen') flagPossibleCapture();
  });

});


/* ==========================================================================
   VISITOR LOGGER
   --------------------------------------------------------------------------
   GitHub Pages only serves static files, so there is no server-side code
   here that can see a visitor's IP address. The trick used below is the
   standard workaround:

     1. The browser asks a public "what is my IP" API for its own IP
        address and (best-effort) city/region/country.
     2. The browser then POSTs that small bit of info to a Google Apps
        Script "Web App" endpoint, which appends a row to a Google Sheet.

   This runs quietly in the background and never blocks page rendering.
   If anything fails (ad blocker, offline, endpoint not set up yet) it
   just gives up silently — a visitor should never see an error because
   of this.

   SETUP (see README.md for full steps):
     1. Deploy the script in google-apps-script/Code.gs as a Web App.
     2. Paste the deployment URL below, replacing the placeholder.
   ========================================================================== */

// Replace this with the Web App URL you get after deploying the script in
// google-apps-script/Code.gs.
const VISITOR_LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxQDG3ThcQir8f88ESADeGaU4kK_bjxhEIfnlHL3qNq8t-allNChsyvrZsPVANUsHFh3w/exec';

(function logVisit() {
  // Skip entirely if the endpoint hasn't been configured yet, or if the
  // page is being opened locally while you're still building the site.
  const notConfigured = !VISITOR_LOG_ENDPOINT || VISITOR_LOG_ENDPOINT.startsWith('PASTE_');
  const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

  if (notConfigured || isLocal) {
    return;
  }

  fetch('https://ipapi.co/json/')
    .then((res) => res.json())
    .then((geo) => sendLog({
      ip: geo.ip || 'unknown',
      city: geo.city || '',
      region: geo.region || '',
      country: geo.country_name || '',
    }))
    .catch(() => {
      // ipapi.co didn't respond (rate limit, blocked, offline, etc).
      // Fall back to just the IP address from a second, simpler API.
      fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => sendLog({ ip: data.ip || 'unknown', city: '', region: '', country: '' }))
        .catch(() => { /* give up quietly, don't affect the page */ });
    });

  function sendLog(location) {
    const payload = {
      timestamp: new Date().toISOString(),
      ip: location.ip,
      city: location.city,
      region: location.region,
      country: location.country,
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
    };

    // Apps Script Web Apps redirect on POST, which browsers block for
    // fetch() unless the mode is set to no-cors. We don't need to read
    // the response anyway, so this is fine.
    fetch(VISITOR_LOG_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).catch(() => { /* give up quietly */ });
  }
})();
