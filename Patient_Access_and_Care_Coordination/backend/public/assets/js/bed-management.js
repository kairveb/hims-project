/* =========================================================================
   IBMS — Inpatient & Bed Management System
   Wired to Laravel: GET /api/beds, PATCH /api/beds/{bed} (via BedController)
   ========================================================================= */

(function () {
  var wardNames = { A: 'Ward A · General Medicine', B: 'Ward B · Surgical', C: 'Ward C · Pediatrics', I: 'ICU' };
  var wardSizes = { A: 24, B: 20, C: 16, I: 12 };

  var wardData = {};
  var backendAvailable = false; // true once /api/beds has loaded successfully

  function buildBlankWards() {
    var next = {};
    Object.keys(wardSizes).forEach(function (w) {
      var beds = [];
      for (var i = 1; i <= wardSizes[w]; i++) {
        beds.push({
          dbId: null,
          id: w + '-' + String(i).padStart(2, '0'),
          status: 'available',
          patient: null,
          note: null
        });
      }
      next[w] = beds;
    });
    return next;
  }

  // BedController::index() returns only { data: { A:[...], B:[...], ... } },
  // so hisApi.get()'s single-key auto-unwrap hands us that grouped object directly.
  async function loadWards() {
    try {
      var data = await window.hisApi.get('/api/beds');
      if (data && typeof data === 'object' && Object.keys(data).length) {
        wardData = data;
        backendAvailable = true;
        return;
      }
      throw new Error('Empty response from /api/beds');
    } catch (e) {
      wardData = buildBlankWards();
      backendAvailable = false;
      if (window.hisToast) hisToast('Could not load bed data from backend — showing local demo wards.', 'error');
    }
  }

  // Persists a status/patient/note change for one bed via PATCH /api/beds/{id}.
  // Falls back to local-only update if the backend isn't reachable (e.g. wards
  // aren't seeded yet), so the UI still stays usable.
  async function updateBedOnBackend(bed, changes) {
    Object.assign(bed, changes);

    if (!backendAvailable || !bed.dbId) {
      return bed;
    }

    try {
      var updated = await window.hisApi.patch('/api/beds/' + bed.dbId, {
        status: bed.status,
        patient: bed.patient,
        note: bed.note
      });
      Object.assign(bed, updated);
      return bed;
    } catch (e) {
      if (window.hisToast) hisToast('Failed to save bed update: ' + String(e && e.message ? e.message : e), 'error');
      return bed;
    }
  }

  var statusMeta = {
    available: { cls: 'st-available', pill: 'ok', label: 'Available' },
    occupied:  { cls: 'st-occupied', pill: 'err', label: 'Occupied' },
    cleaning:  { cls: 'st-cleaning', pill: 'warn', label: 'Cleaning' },
    reserved:  { cls: 'st-reserved', pill: 'info', label: 'Reserved' }
  };

  var currentWard = 'A';

  function renderWard(w) {
    currentWard = w;
    var titleEl = document.getElementById('wardTitle');
    if (titleEl) titleEl.textContent = wardNames[w] || w;

    var beds = wardData[w] || [];
    var occupied = beds.filter(function (b) { return b.status === 'occupied'; }).length;
    var available = beds.filter(function (b) { return b.status === 'available'; }).length;
    var cleaning = beds.filter(function (b) { return b.status === 'cleaning'; }).length;
    var reserved = beds.filter(function (b) { return b.status === 'reserved'; }).length;

    var occEl = document.getElementById('wardOccupancy');
    if (occEl) {
      occEl.textContent = beds.length
        ? occupied + ' / ' + beds.length + ' occupied (' + Math.round(occupied / beds.length * 100) + '%)'
        : 'No beds on file for this ward.';
    }

    var allAvailableEl = document.getElementById('bedsAvailableKpi');
    var allOccupiedEl = document.getElementById('bedsOccupiedKpi');
    var allCleaningEl = document.getElementById('bedsCleaningKpi');
    var allReservedEl = document.getElementById('bedsReservedKpi');
    if (allAvailableEl) allAvailableEl.textContent = String(available);
    if (allOccupiedEl) allOccupiedEl.textContent = String(occupied);
    if (allCleaningEl) allCleaningEl.textContent = String(cleaning);
    if (allReservedEl) allReservedEl.textContent = String(reserved);

    var grid = document.getElementById('bedGrid');
    if (!grid) return;

    grid.innerHTML = beds.map(function (b) {
      var m = statusMeta[b.status] || statusMeta.available;
      return '<div class="col">' +
        '<div class="bed ' + m.cls + '" data-bed="' + b.id + '">' +
          '<div class="bed-dot"></div>' +
          '<div class="bed-id">' + b.id + '</div>' +
          '<button type="button" class="bed-room-btn" data-bed-action="toggle" data-bed-room="' + b.id + '">' +
            'Room ' + b.id +
          '</button>' +
          '<div class="text-muted-c" style="font-size:.7rem;">' + (b.patient || m.label) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('.bed').forEach(function (el) {
      el.addEventListener('click', function () { openBedModal(el.dataset.bed); });
    });

    // Room button quick-toggle: cycles bed status without opening modal.
    grid.querySelectorAll('.bed-room-btn').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        var bedId = btn.dataset.bedRoom;
        var bed = wardData[currentWard].find(function (b) { return b.id === bedId; });
        if (!bed) return;

        btn.disabled = true;
        try {
          if (bed.status === 'available') {
            await updateBedOnBackend(bed, { status: 'occupied', patient: null, note: null });
            hisToast('Bed ' + bed.id + ' set to occupied.', 'success');
          } else if (bed.status === 'occupied') {
            await updateBedOnBackend(bed, { status: 'cleaning', patient: null, note: null });
            hisToast('Bed ' + bed.id + ' marked for cleaning.', 'warning');
          } else if (bed.status === 'cleaning') {
            await updateBedOnBackend(bed, { status: 'available', note: null });
            hisToast('Bed ' + bed.id + ' is now available.', 'success');
          } else {
            await updateBedOnBackend(bed, { status: 'available', note: null });
            hisToast('Bed ' + bed.id + ' released to available.', 'info');
          }
          renderWard(currentWard);
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  var activeBedId = null;

  async function handleBedModalAction(actionBtnId) {
    if (!activeBedId) return;
    var bed = wardData[currentWard].find(function (b) { return b.id === activeBedId; });
    if (!bed) return;

    var modalEl = document.getElementById('bedModal');
    var modal = null;
    try {
      modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    } catch (e) {
      modal = null;
    }

    if (actionBtnId === 'assignBedBtn') {
      await updateBedOnBackend(bed, { status: 'occupied', patient: null, note: null });
      if (modal) modal.hide();
      renderWard(currentWard);
      hisToast('Bed ' + bed.id + ' assigned.', 'success');
      return;
    }

    if (actionBtnId === 'dischargeBedBtn') {
      await updateBedOnBackend(bed, { status: 'cleaning', patient: null, note: null });
      if (modal) modal.hide();
      renderWard(currentWard);
      hisToast('Bed ' + bed.id + ' marked for cleaning.', 'warning');
      return;
    }

    if (actionBtnId === 'readyBedBtn') {
      await updateBedOnBackend(bed, { status: 'available', note: null });
      if (modal) modal.hide();
      renderWard(currentWard);
      hisToast('Bed ' + bed.id + ' is now available.', 'success');
    }
  }

  var bedModalFooterEl = document.getElementById('bedModalFooter');
  if (bedModalFooterEl) {
    bedModalFooterEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !btn.id) return;
      if (btn.id === 'assignBedBtn' || btn.id === 'dischargeBedBtn' || btn.id === 'readyBedBtn') {
        e.preventDefault();
        handleBedModalAction(btn.id);
      }
    });
  }

  function openBedModal(bedId) {
    activeBedId = bedId;
    var bed = wardData[currentWard].find(function (b) { return b.id === bedId; });
    if (!bed) return;

    var m = statusMeta[bed.status] || statusMeta.available;

    document.getElementById('bedModalBody').innerHTML = '';
    document.getElementById('bedModalFooter').innerHTML = '';
    document.getElementById('bedModalTitle').textContent = 'Bed ' + bed.id;

    var body = '<div class="mb-3"><span class="status-pill ' + m.pill + '">' + m.label + '</span></div>';
    if (bed.status === 'occupied') {
      body += '<div class="mb-2"><span class="text-muted-c small">Patient</span><div class="fw-semibold">' + (bed.patient || 'Not yet assigned') + '</div></div>' +
              '<div class="mb-2"><span class="text-muted-c small">Admitted</span><div>Pending backend admission details</div></div>';
    } else if (bed.status === 'reserved') {
      body += '<div class="mb-2"><span class="text-muted-c small">Note</span><div>' + (bed.note || 'Reserved — pending admission.') + '</div></div>';
    } else if (bed.status === 'cleaning') {
      body += '<div class="mb-2"><span class="text-muted-c small">Note</span><div>' + (bed.note || 'Housekeeping in progress.') + '</div></div>';
    } else {
      body += '<div class="text-muted-c">This bed is available for immediate assignment.</div>';
    }
    document.getElementById('bedModalBody').innerHTML = body;

    var footer = '';
    if (bed.status === 'available') {
      footer = '<button type="button" class="btn btn-outline-c" data-bs-dismiss="modal">Close</button><button type="button" class="btn btn-accent" id="assignBedBtn">Assign patient</button>';
    } else if (bed.status === 'occupied') {
      footer = '<button class="btn btn-outline-c" data-bs-dismiss="modal">Close</button><button class="btn" style="background:var(--warn);color:#fff;" id="dischargeBedBtn">Discharge &amp; mark cleaning</button>';
    } else if (bed.status === 'cleaning') {
      footer = '<button class="btn btn-outline-c" data-bs-dismiss="modal">Close</button><button class="btn btn-accent" id="readyBedBtn">Mark ready</button>';
    } else {
      footer = '<button class="btn btn-outline-c" data-bs-dismiss="modal">Close</button>';
    }
    document.getElementById('bedModalFooter').innerHTML = footer;

    var modal = null;
    try {
      modal = new bootstrap.Modal(document.getElementById('bedModal'));
    } catch (e) {
      modal = null;
    }
    if (modal) modal.show();
  }

  document.querySelectorAll('#wardTabs .nav-link').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#wardTabs .nav-link').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderWard(tab.dataset.ward);
    });
  });

  async function init() {
    await loadWards();
    renderWard('A');
  }

  init();
})();
