/* =========================================================================
   DASHBOARD — calls Laravel API and fills KPI cards
   ========================================================================= */

(function () {
  'use strict';

  async function loadSummary() {
    var activeEl = document.querySelector('#kpiRegistrationsToday');
    var bookedEl = document.querySelector('#kpiAppointmentsBooked');
    var teleEl = document.querySelector('#kpiActiveTelehealth');
    var bedEl = document.querySelector('#kpiBedOccupancy');

    try {
      if (!window.hisApi?.get) return;

      var data = await window.hisApi.get('/api/dashboard/summary');

      // Backends returns: { registrationsToday, appointmentsBooked, activeTelehealth, bedOccupancy }
      if (activeEl) activeEl.textContent = String(data.registrationsToday ?? 0);
      if (bookedEl) bookedEl.textContent = String(data.appointmentsBooked ?? 0);
      if (teleEl) teleEl.textContent = String(data.activeTelehealth ?? 0);
      if (bedEl) bedEl.textContent = String(data.bedOccupancy ?? '0%');
    } catch (e) {
      if (activeEl) activeEl.textContent = '—';
      if (bookedEl) bookedEl.textContent = '—';
      if (teleEl) teleEl.textContent = '—';
      if (bedEl) bedEl.textContent = '—';

      if (window.hisToast) window.hisToast(String(e && e.message ? e.message : e), 'error');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadSummary);
  else loadSummary();
})();

