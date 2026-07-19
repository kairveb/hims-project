/* =========================================================================
   Telehealth — Daily.co embed
   - Fetches `roomUrl` from Laravel backend endpoint
   - Embeds Daily in-page using DailyIframe
   ========================================================================= */

(function () {
  'use strict';

  // === CONFIG (update if your Laravel endpoint differs) ===
  var ROOM_URL_ENDPOINT = '/api/telehealth/start-room';
  // =======================================================

  var dailyCall = null;
  var dailyIframe = null;

  function hisToastInfo(msg) {
    if (window.hisToast) hisToast(msg, 'info');
  }

  function hisToastError(msg) {
    if (window.hisToast) hisToast(msg, 'error');
  }

  async function fetchRoomUrl() {
    var res = await fetch(ROOM_URL_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      var txt;
      try { txt = await res.text(); } catch (e) { txt = ''; }
      throw new Error('Failed to fetch roomUrl (' + res.status + '). ' + (txt || ''));
    }

    var data = await res.json();

    if (!data || !data.roomUrl) {
      throw new Error('Invalid backend response: expected { roomUrl: "..." }');
    }

    return data.roomUrl;
  }

  async function ensureDailyLoaded() {
    if (window.DailyIframe && typeof window.DailyIframe.createCallObject === 'function') return;

    await new Promise(function (resolve, reject) {
      var existing = document.getElementById('daily-iframe-loader');
      if (existing) {
        // Script already requested/loaded, just wait a bit
        setTimeout(resolve, 250);
        return;
      }

      var script = document.createElement('script');
      script.id = 'daily-iframe-loader';
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.async = true;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Failed to load Daily.co script')); };
      document.head.appendChild(script);
    });
  }

  function getContainer() {
    return document.getElementById('daily-container');
  }

  function clearContainer() {
    var el = getContainer();
    if (!el) return;
    el.innerHTML = '';
  }

  window.telehealthStop = function () {
    try {
      if (dailyCall && typeof dailyCall.destroy === 'function') {
        dailyCall.destroy();
      }
    } catch (e) {
      // ignore
    }

    dailyCall = null;
    dailyIframe = null;
    clearContainer();
  };

  window.telehealthStart = async function () {
    var container = getContainer();
    if (!container) {
      hisToastError('Daily container element (#daily-container) not found.');
      return;
    }

    // prevent duplicate sessions
    if (dailyCall) {
      hisToastInfo('Telehealth session already running.');
      return;
    }

    try {
      hisToastInfo('Starting telehealth session...');
      await ensureDailyLoaded();

      var roomUrl = await fetchRoomUrl();
      clearContainer();

      // Create Daily call object and attach to container
      // DailyIframe API: createCallObject({ url, iframeStyle, ... })
      dailyIframe = window.DailyIframe;
      dailyCall = dailyIframe.createCallObject();

      // join
      dailyCall.join({
        url: roomUrl
      });

      // Render UI
      // Some Daily versions support `setIframe`.
      // We'll do best-effort for compatibility.
      if (typeof dailyCall.setIframe === 'function') {
        dailyCall.setIframe(container);
      } else if (container) {
        // Fallback: Daily creates its own iframe; we rely on Daily's internals.
        // If this doesn't render, update implementation based on your Daily docs version.
      }

      // Listen for lifecycle events (best-effort)
      if (typeof dailyCall.on === 'function') {
        dailyCall.on('joined-meeting', function () {
          if (window.hisToast) hisToast('Telehealth session connected.', 'success');
        });
        dailyCall.on('left-meeting', function () {
          dailyCall = null;
          dailyIframe = null;
        });
        dailyCall.on('error', function (e) {
          hisToastError('Telehealth error: ' + (e && e.message ? e.message : String(e)));
        });
      }
    } catch (e) {
      window.telehealthStop();
      hisToastError(String(e && e.message ? e.message : e));
    }
  };
})();

