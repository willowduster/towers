/* global site, loader */
(function () {
  'use strict';

  // ── Year in footer ────────────────────────────────────────────
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── Loading screen ────────────────────────────────────────────
  var loader = document.getElementById('loader');
  var site   = document.getElementById('site');

  function revealSite() {
    if (loader) {
      loader.classList.add('loader-done');
    }
    if (site) {
      site.classList.remove('site-hidden');
      site.classList.add('site-visible');
    }
    // Trigger initial fade-in sections that are already in view
    checkFadeIns();
  }

  // Minimum display time for the loading screen (ms)
  var MIN_LOADER_MS = 1800;
  var startTime = Date.now();

  function onReady() {
    var elapsed = Date.now() - startTime;
    var remaining = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(revealSite, remaining);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // ── Scroll-triggered fade-in sections ─────────────────────────
  var fadeSections = [];

  function checkFadeIns() {
    var threshold = window.innerHeight * 0.88;
    fadeSections.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < threshold) {
        el.classList.add('visible');
      }
    });
  }

  // Collect elements after DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    fadeSections = Array.prototype.slice.call(
      document.querySelectorAll('.fade-in-section')
    );

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      fadeSections.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: scroll listener
      window.addEventListener('scroll', checkFadeIns, { passive: true });
      checkFadeIns();
    }
  });

}());
