/* global site, loader */
(function () {
  'use strict';

  // ── Reliable mobile viewport height ───────────────────────────
  function setAppHeight() {
    document.documentElement.style.setProperty(
      '--app-height',
      window.innerHeight + 'px'
    );
  }
  setAppHeight();
  window.addEventListener('resize', setAppHeight);

  // ── Stream status check ───────────────────────────────────────
  var OWNCAST_URL = 'https://stream.willowduster.com';
  var HLS_URL = OWNCAST_URL + '/hls/stream.m3u8';
  var YT_PLAYLIST_ID = 'PL3L7IDSgjMHTcHMWr9IPVm1-I3ipbjkOG';
  var streamVideo = document.getElementById('stream-video');
  var streamOffline = document.getElementById('stream-offline');
  var unmuteOverlay = document.getElementById('unmute-overlay');
  var unmuteBtn = document.getElementById('unmute-btn');
  var ytPlayerWrap = document.getElementById('yt-player-wrap');
  var ytIframe = document.getElementById('yt-player');
  var isLive = false;
  var hls = null;
  var offlineTimer = null;
  var ytShowing = false;

  // Dismiss unmute overlay on click (for live stream)
  unmuteBtn.addEventListener('click', function () {
    streamVideo.muted = false;
    unmuteOverlay.classList.add('unmute-overlay-hidden');
  });

  function showUnmuteHint() {
    unmuteOverlay.classList.remove('unmute-overlay-hidden');
    // Auto-dismiss after 4 seconds
    setTimeout(function () {
      unmuteOverlay.classList.add('unmute-overlay-hidden');
    }, 4000);
  }

  function showStream() {
    if (isLive) return;
    isLive = true;

    // Cancel any pending offline→YouTube transition
    clearTimeout(offlineTimer);
    offlineTimer = null;

    // Hide YouTube player if it's showing
    hideYouTube();

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(HLS_URL);
      hls.attachMedia(streamVideo);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        streamVideo.play().catch(function () {
          streamVideo.muted = true;
          streamVideo.play();
        });
        showUnmuteHint();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          destroyHls();
          showOffline();
        }
      });
    } else if (streamVideo.canPlayType('application/vnd.apple.mpegurl')) {
      streamVideo.src = HLS_URL;
      streamVideo.addEventListener('loadedmetadata', function () {
        streamVideo.play().catch(function () {
          streamVideo.muted = true;
          streamVideo.play();
        });
        showUnmuteHint();
      });
    }

    streamVideo.classList.remove('stream-video-hidden');
    streamOffline.classList.add('stream-offline-hidden');
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  // ── YouTube fallback player ───────────────────────────────────
  function hideYouTube() {
    if (ytShowing) {
      ytShowing = false;
      ytPlayerWrap.classList.add('yt-player-hidden');
      ytIframe.removeAttribute('src');
    }
  }

  function showYouTube() {
    if (isLive || ytShowing) return;
    ytShowing = true;

    // Embed latest video with uploads playlist for auto-advance
    ytIframe.src = 'https://www.youtube.com/embed/videoseries?list='
      + encodeURIComponent(YT_PLAYLIST_ID);

    // Fade out the offline screen, fade in the YouTube player
    streamOffline.classList.add('stream-offline-hidden');
    ytPlayerWrap.classList.remove('yt-player-hidden');
  }

  function startOfflineTimer() {
    clearTimeout(offlineTimer);
    offlineTimer = setTimeout(function () {
      if (!isLive) {
        showYouTube();
      }
    }, 3000);
  }

  function showOffline() {
    destroyHls();
    streamVideo.removeAttribute('src');
    var wasLive = isLive;
    isLive = false;
    streamVideo.classList.add('stream-video-hidden');

    if (!ytShowing) {
      streamOffline.classList.remove('stream-offline-hidden');
      // Start 5-second timer to transition to YouTube videos
      startOfflineTimer();
    }
  }

  function checkStreamStatus() {
    fetch(OWNCAST_URL + '/api/status')
      .then(function (res) {
        if (!res.ok) throw new Error('not ok');
        return res.json();
      })
      .then(function (data) {
        if (data && data.online) {
          showStream();
        } else {
          showOffline();
        }
      })
      .catch(function () {
        showOffline();
      });
  }

  // Check immediately and poll every 10 seconds
  checkStreamStatus();
  setInterval(checkStreamStatus, 10000);

  // ── Year in footer ────────────────────────────────────────────
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
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
