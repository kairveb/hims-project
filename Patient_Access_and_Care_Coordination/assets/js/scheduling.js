// ASS — Appointment & Scheduling System
// Wired to Laravel: GET/POST /api/appointments (via AppointmentController)
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const SLOT_MINUTES = 30;
  const START_MIN = 8 * 60;
  const END_MIN = 17 * 60;

  // In-memory cache of appointments loaded from the backend.
  let appointments = [];

  function parseTimeToMinutes(t) {
    const [hh, mm] = String(t || '').split(':').map((x) => Number(x));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
    return hh * 60 + mm;
  }

  function minutesToTime(m) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function toISODate(d) {
    return d.toISOString().slice(0, 10);
  }

  async function loadAppointments() {
    try {
      // AppointmentController::index() returns only { data: [...] }, so
      // hisApi.get()'s single-key auto-unwrap hands us the array directly.
      const resp = await window.hisApi.get('/api/appointments');
      appointments = Array.isArray(resp) ? resp : [];
    } catch (e) {
      appointments = [];
      if (window.hisToast) hisToast(String(e && e.message ? e.message : e), 'error');
    }
  }

  function renderWeekGrid({ weekStart }) {
    const grid = $('#weekGrid');
    if (!grid) return;

    const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)); // Mon..Fri
    const times = [];
    for (let m = START_MIN; m < END_MIN; m += SLOT_MINUTES) times.push(m);

    grid.innerHTML = '';

    for (const tMin of times) {
      const time = minutesToTime(tMin);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="text-muted-c" style="width:70px;">${time}</td>`;

      for (let dIdx = 0; dIdx < 5; dIdx++) {
        const dateISO = toISODate(days[dIdx]);
        const match = appointments.find((a) => a.date === dateISO && a.time === time);

        if (!match) {
          tr.innerHTML += '<td></td>';
          continue;
        }

        const visitType = match.visitType === 'Telehealth' ? 'Telehealth' : 'In-person';
        const pillClass = visitType === 'Telehealth' ? 'status-pill info' : 'status-pill ok';
        const physicianShort = String(match.physician || '').split('—')[0].trim();

        tr.innerHTML += `
          <td>
            <div class="d-flex flex-column align-items-center justify-content-center" style="gap:2px;">
              <span class="${pillClass}">${visitType === 'Telehealth' ? 'Tele' : 'In-person'}</span>
              <span style="font-size:.78rem; font-weight:700; line-height:1;">${physicianShort}</span>
            </div>
          </td>
        `;
      }

      grid.appendChild(tr);
    }
  }

  function renderTodayList() {
    const root = $('#todayList');
    if (!root) return;

    const todayISO = new Date().toISOString().slice(0, 10);
    const todays = appointments
      .filter((a) => a.date === todayISO)
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    root.innerHTML = '';

    const statusPill = $('#todayCount');
    if (statusPill) statusPill.textContent = String(todays.length);

    if (todays.length === 0) {
      root.innerHTML = '<div class="text-muted-c small">No appointments for today.</div>';
      return;
    }

    todays.slice(0, 50).forEach((a) => {
      const typeTag = a.visitType === 'Telehealth'
        ? '<span class="status-pill info">Telehealth</span>'
        : '<span class="status-pill ok">In-person</span>';

      root.innerHTML += `
        <div class="timeline-item" style="border-left:none; margin-left:0; padding-left:1.1rem;">
          <div class="d-flex justify-content-between gap-2">
            <strong style="font-size:.86rem;">${a.patient || ''}</strong>
            <span class="text-muted-c small">${a.time}</span>
          </div>
          <div class="text-muted-c small">${typeTag} ${a.physician || ''}</div>
        </div>
      `;
    });
  }

  function initApptModal() {
    const modalForm = $('#apptForm');
    const saveBtn = $('#saveApptBtn');
    if (!modalForm || !saveBtn) return;

    const dateInput = modalForm.querySelector('input[type="date"]');
    const timeInput = modalForm.querySelector('input[type="time"]');

    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!modalForm.checkValidity()) {
        modalForm.classList.add('was-validated');
        return;
      }

      const patient = modalForm.querySelector('input')?.value?.trim() || '';
      const physician = modalForm.querySelector('select')?.value || '';
      const date = dateInput?.value;
      const time = timeInput?.value;
      const visitType = modalForm.querySelector('input[name="visitType"]:checked')?.id === 'vt2' ? 'Telehealth' : 'In-person';

      saveBtn.disabled = true;

      try {
        // AppointmentController::store() returns { data: appointment }, so
        // hisApi.post()'s single-key auto-unwrap hands us the object directly.
        await window.hisApi.post('/api/appointments', {
          patient,
          physician,
          visitType,
          date,
          time
        });

        // Refresh from backend so the grid reflects the persisted record.
        await loadAppointments();

        window.hisToast(`Appointment booked for ${date} at ${time}.`, 'success');

        modalForm.classList.remove('was-validated');
        modalForm.reset();

        const ws = getWeekStart(date ? new Date(date) : new Date());
        renderWeekGrid({ weekStart: ws });
        renderTodayList();

        const modalEl = $('#newApptModal');
        modalEl?.querySelector('[data-bs-dismiss="modal"]')?.click?.();
      } catch (err) {
        window.hisToast(String(err && err.message ? err.message : err), 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  async function init() {
    var newApptBtn = document.querySelector('[data-nav-action="new-appointment"]');
    if (newApptBtn && window.bootstrap?.Modal) {
      newApptBtn.addEventListener('click', function () {
        var modalEl = document.getElementById('newApptModal');
        if (!modalEl) return;
        new window.bootstrap.Modal(modalEl).show();
      });
    }

    const ws = getWeekStart(new Date());

    await loadAppointments();
    renderWeekGrid({ weekStart: ws });
    renderTodayList();
    initApptModal();

    const weekState = { offset: 0, base: ws };
    const group = document.querySelector('.btn-group[aria-label="Week navigation"]');
    const groupBtns = group ? $$('button', group) : [];
    const leftBtn = groupBtns[0];
    const todayBtn = groupBtns[1];
    const rightBtn = groupBtns[2];

    function bind(btn, type) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (type === 'left') weekState.offset -= 1;
        if (type === 'right') weekState.offset += 1;
        if (type === 'today') weekState.offset = 0;
        const newWs = addDays(weekState.base, weekState.offset * 7);
        renderWeekGrid({ weekStart: newWs });
        renderTodayList();
      });
    }

    bind(leftBtn, 'left');
    bind(todayBtn, 'today');
    bind(rightBtn, 'right');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
