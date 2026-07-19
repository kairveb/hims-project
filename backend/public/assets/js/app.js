/* =========================================================================
   HIS — shared shell behavior (sidebar + clock + nav highlight + toast)
   This file should NOT contain demo data.
   ========================================================================= */

(function () {
  'use strict';

  // Toast helper (no external dependency; uses Bootstrap toast if present)
  window.hisToast = function hisToast(message, variant) {
    variant = variant || 'success';

    // Dependency-free fallback
    let toastEl = document.getElementById('hisToastFallback');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'hisToastFallback';
      toastEl.style.position = 'fixed';
      toastEl.style.right = '16px';
      toastEl.style.bottom = '16px';
      toastEl.style.zIndex = '2000';
      toastEl.style.maxWidth = '440px';
      toastEl.style.pointerEvents = 'none';
      document.body.appendChild(toastEl);
    }

    const colors = {
      success: 'rgba(46,158,108,0.16)',
      warning: 'rgba(245,165,36,0.16)',
      error: 'rgba(225,72,63,0.16)',
      info: 'rgba(27,107,110,0.12)'
    };
    const borders = {
      success: 'rgba(46,158,108,0.38)',
      warning: 'rgba(245,165,36,0.45)',
      error: 'rgba(225,72,63,0.45)',
      info: 'rgba(27,107,110,0.35)'
    };

    const bg = colors[variant] || colors.info;
    const br = borders[variant] || borders.info;

    toastEl.innerHTML = `
      <div style="background:${bg};border:1px solid ${br};border-radius:14px;padding:10px 12px;box-shadow:0 10px 25px rgba(15,61,62,0.12);font-family:var(--font-body, Inter), sans-serif;color:var(--c-text,#12222A);">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:2px;">MedCore HIS</div>
        <div style="font-size:.85rem;opacity:.95;">${String(message || '')}</div>
      </div>
    `;

    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(10px)';
    toastEl.style.transition = 'opacity .2s ease, transform .2s ease';

    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';
    });

    clearTimeout(window.hisToast._t);
    window.hisToast._t = setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
    }, 3200);
  };

  // Initialize once DOM is ready
  function initShell() {
    // Top-right quick actions ("+" buttons) may route to other modules
    document.querySelectorAll('[data-nav-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-nav-action');
        var current = window.location.pathname.split('/').pop() || 'dashboard.html';
        // If we're already on the destination page, its own script opens a modal
        // instead — don't navigate (that would reload the page and kill the modal).
        if (action === 'new-patient' && current !== 'registration.html') {
          window.location.href = 'registration.html';
        } else if (action === 'new-appointment' && current !== 'scheduling.html') {
          window.location.href = 'scheduling.html';
        }
      });
    });

    var toggleBtns = document.querySelectorAll('.sidebar-toggle');
    var sidebar = document.querySelector('.sidebar');
    var backdrop = document.querySelector('.sidebar-backdrop');

    // Hide sidebar on any click that targets those nav buttons
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.closest && t.closest('[data-nav-action]')) {
        if (sidebar) sidebar.classList.remove('show');
        if (backdrop) {
          backdrop.classList.add('d-none');
          backdrop.style.display = '';
        }
      }
    }, true);

    var navLinks = document.querySelectorAll('.sidebar-menu .menu-item');

    // Collapsible rail: desktop collapses/expands; mobile overlays.
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('show');
      if (backdrop) {
        backdrop.classList.add('d-none');
        // also remove any accidental visibility helpers
        backdrop.style.display = '';
      }
    }

    function openSidebar() {
      if (sidebar) sidebar.classList.add('show');
      if (backdrop) {
        backdrop.classList.remove('d-none');
        backdrop.style.display = '';
      }
    }

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!sidebar) return;
        if (sidebar.classList.contains('show')) closeSidebar();
        else openSidebar();
      });
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeSidebar);
    }

    // Close after navigation
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeSidebar();
      });
    });

    // ESC closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });


    // active nav link based on current filename
    var current = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.toggle('active', href === current);
    });

    // live clock in topbar
    var clockEl = document.querySelector('[data-clock]');
    if (clockEl) {
      function tick() {
        var now = new Date();
        var opts = { weekday: 'short', month: 'short', day: 'numeric' };
        var dateStr = now.toLocaleDateString('en-US', opts);
        var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        clockEl.textContent = dateStr + ' · ' + timeStr;
      }
      tick();
      setInterval(tick, 30000);
    }

    // tooltip init if present
    if (window.bootstrap?.Tooltip) {
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        new window.bootstrap.Tooltip(el);
      });
    }

    // backend-ready storage key for cross-module data
    var STORAGE_KEY = 'his_state_v1';

    function safeJsonParse(v, fallback) {
      try { return JSON.parse(v); } catch { return fallback; }
    }

    function getState() {
      var raw = localStorage.getItem(STORAGE_KEY);
      return safeJsonParse(raw, {
        patients: [],
        appointments: [],
        erIntakes: [],
        queue: [],
        beds: {},
        counters: { registrationToday: 0, patientTotal: 0 }
      });
    }

    function setState(next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    window.hisStore = {
      getState: getState,
      setState: setState
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell);
  } else {
    initShell();
  }
})();

