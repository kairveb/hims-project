/* =========================================================================
   apiClient.js — small fetch wrapper for Laravel API
   Exposes: window.hisApi.get/post/patch
   ========================================================================= */

(function () {
  'use strict';

  async function request(method, url, body) {
    const opts = {
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);
    if (!res.ok) {
      let msg = '';
      try { msg = await res.text(); } catch (e) { /* ignore */ }
      throw new Error('API ' + method + ' ' + url + ' failed (' + res.status + '). ' + (msg || ''));
    }

    // Some endpoints may return empty body (204). Use text guard.
    const contentType = res.headers.get('Content-Type') || '';
    if (res.status === 204 || !contentType.includes('application/json')) {
      return null;
    }

    const data = await res.json();
    // Most endpoints return {data: ...}; pass through either way.
    return data && data.data !== undefined ? data.data : data;
  }

  function normalize(url) {
    // allow callers to pass absolute or relative
    if (!url) return url;
    return url.startsWith('http://') || url.startsWith('https://') ? url : url;
  }

  window.hisApi = {
    get: function (url) { return request('GET', normalize(url)); },
    post: function (url, body) { return request('POST', normalize(url), body); },
    patch: function (url, body) { return request('PATCH', normalize(url), body); }
  };
})();

