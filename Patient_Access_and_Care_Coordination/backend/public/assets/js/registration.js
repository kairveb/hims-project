/* =========================================================================
   SPRS — Smart Patient Registration System
   Wired to Laravel: GET/POST /api/patients (via PatientController)
   ========================================================================= */

(function () {
  'use strict';

  var patients = [];

  var statusMap = {
    Active: '<span class="status-pill ok">Active</span>',
    Pending: '<span class="status-pill warn">Pending Verification</span>',
    Admitted: '<span class="status-pill info">Admitted</span>'
  };

  // PatientController::index() returns { data: [...], stats: {...} }.
  // apiClient.js auto-unwraps a top-level "data" key, which would silently
  // drop "stats". We do a plain fetch here so we keep both.
  async function fetchPatients() {
    var res = await fetch('/api/patients', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      var msg = '';
      try { msg = await res.text(); } catch (e) { /* ignore */ }
      throw new Error('Failed to load patients (' + res.status + '). ' + (msg || ''));
    }
    return res.json(); // { data: [...], stats: { today, total, queue } }
  }

  function updateStats(stats) {
    var todayEl = document.getElementById('statToday');
    var totalEl = document.getElementById('statTotal');
    var queueEl = document.getElementById('statQueue');

    if (stats) {
      if (todayEl) todayEl.textContent = String(stats.today ?? 0);
      if (totalEl) totalEl.textContent = String(stats.total ?? 0);
      if (queueEl) queueEl.textContent = String(stats.queue ?? 0);
    } else {
      if (totalEl) totalEl.textContent = String(patients.length);
      if (queueEl) queueEl.textContent = String(patients.filter(function (p) { return p.status === 'Pending'; }).length);
    }
  }

  function render() {
    var tbody = document.querySelector('#patientTable tbody');
    var searchEl = document.getElementById('searchInput');
    var filterEl = document.getElementById('filterStatus');
    var q = ((searchEl && searchEl.value) || '').toLowerCase();
    var statusFilter = (filterEl && filterEl.value) || '';

    var rows = patients.filter(function (p) {
      var matchesQ = !q || (p.name || '').toLowerCase().indexOf(q) > -1 || (p.id || '').toLowerCase().indexOf(q) > -1;
      var matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesQ && matchesStatus;
    });

    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted-c py-4">No matching patient records.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(function (p) {
      return '<tr>' +
        '<td class="text-mono">' + p.id + '</td>' +
        '<td>' +
          '<div class="d-flex align-items-center gap-2">' +
            '<img src="https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(p.name) + '&backgroundColor=EEF4F4&textColor=0F3D3E" width="30" height="30" class="rounded-circle">' +
            '<span class="fw-semibold">' + p.name + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + p.age + ' / ' + p.sex + '</td>' +
        '<td class="text-mono">' + p.contact + '</td>' +
        '<td class="text-muted-c">' + p.date + '</td>' +
        '<td>' + (statusMap[p.status] || p.status) + '</td>' +
        '<td class="text-end"><button class="btn btn-sm btn-outline-c">View</button></td>' +
      '</tr>';
    }).join('');
  }

  async function loadPatients() {
    var tbody = document.querySelector('#patientTable tbody');
    try {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted-c py-4">Loading patient records...</td></tr>';
      var resp = await fetchPatients();
      patients = Array.isArray(resp.data) ? resp.data : [];
      updateStats(resp.stats);
      render();
    } catch (e) {
      patients = [];
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted-c py-4">Could not load patient records.</td></tr>';
      updateStats(null);
      if (window.hisToast) hisToast(String(e && e.message ? e.message : e), 'error');
    }
  }

  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', render);

  var filterStatus = document.getElementById('filterStatus');
  if (filterStatus) filterStatus.addEventListener('change', render);

  var newPatientBtn = document.querySelector('[data-nav-action="new-patient"]');
  if (newPatientBtn && window.bootstrap?.Modal) {
    newPatientBtn.addEventListener('click', function () {
      var modalEl = document.getElementById('newPatientModal');
      if (!modalEl) return;
      new window.bootstrap.Modal(modalEl).show();
    });
  }

  var saveBtn = document.getElementById('saveRegistrationBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async function () {
      var form = document.getElementById('registerForm');
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

      var first = document.getElementById('firstName').value.trim();
      var last = document.getElementById('lastName').value.trim();
      var age = document.getElementById('age').value.trim();
      var sex = document.getElementById('sex').value;
      var contact = document.getElementById('contact').value.trim();

      saveBtn.disabled = true;

      try {
        // PatientController::store() only returns { data: patient }, so
        // hisApi's single-key auto-unwrap gives us the patient object directly.
        var newPatient = await window.hisApi.post('/api/patients', {
          firstName: first,
          lastName: last,
          age: age ? Number(age) : null,
          sex: sex,
          contact: contact
        });

        // Refresh from backend so stats (today/total/queue) stay accurate.
        await loadPatients();

        var modalEl = document.getElementById('newPatientModal');
        bootstrap.Modal.getInstance(modalEl)?.hide();
        form.reset();
        form.classList.remove('was-validated');
        hisToast('Patient registered — ID <strong>' + newPatient.id + '</strong> generated.', 'success');
      } catch (e) {
        hisToast(String(e && e.message ? e.message : e), 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadPatients);
  else loadPatients();
})();
