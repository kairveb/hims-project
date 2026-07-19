/* =========================================================================
   EERTS — Emergency & ER Triage System
   Mock AI acuity engine: rule-weighted heuristic over vitals + symptoms.
   In production this call is replaced by a request to the AI triage model.
   ========================================================================= */

(function () {

  var acuityMeta = {
    1: { label: 'Level 1 · Critical / Resuscitation', cls: 'acuity-1', action: 'Immediate physician response. Bed auto-reserved in Resuscitation Bay.' },
    2: { label: 'Level 2 · Emergent',                  cls: 'acuity-2', action: 'See within 10 minutes. Prioritize ahead of Level 3–5.' },
    3: { label: 'Level 3 · Urgent',                     cls: 'acuity-3', action: 'See within 30 minutes. Reassess vitals every 15 min.' },
    4: { label: 'Level 4 · Less Urgent',                 cls: 'acuity-4', action: 'See within 60 minutes. Stable, can wait for next opening.' },
    5: { label: 'Level 5 · Non-Urgent',                  cls: 'acuity-5', action: 'Routine care queue. Consider outpatient / telehealth redirect.' }
  };

  var queue = [];

  function loadQueueFromBackend() {
    return window.hisApi.get('/api/triage/queue').then(function (qResp) {
      // hisApi.get() already unwraps the {data:[...]} envelope, so qResp IS the array.
      queue = Array.isArray(qResp) ? qResp : [];
      renderQueue();
    }).catch(function () {
      // keep current queue (mock) if backend is unreachable
    });
  }

  function renderQueue() {
    queue.sort(function (a, b) { return a.level - b.level; });
    var holder = document.getElementById('erQueue');
    if (!holder) return;

    if (!queue.length) {
      holder.innerHTML = '<div class="text-muted-c small py-3">No ER queue items yet.</div>';
      return;
    }

    holder.innerHTML = queue.map(function (p) {
      var m = acuityMeta[p.level];
      return '<div class="d-flex align-items-stretch gap-3 py-3 border-bottom">' +
        '<div class="acuity-bar ' + m.cls + '"></div>' +
        '<div class="flex-grow-1">' +
          '<div class="d-flex align-items-center gap-2 flex-wrap">' +
            '<span class="fw-semibold">' + (p.name || '') + '</span>' +
            '<span class="text-mono text-muted-c" style="font-size:.72rem;">' + (p.id || '') + '</span>' +
            '<span class="acuity ' + m.cls + '">' + m.label + '</span>' +
          '</div>' +
          '<div class="text-muted-c" style="font-size:.82rem;">' + (p.complaint || '') + ' · ' + (p.vitals || '') + '</div>' +
        '</div>' +
        '<div class="text-end">' +
          '<div class="text-muted-c" style="font-size:.72rem;">Waiting</div>' +
          '<div class="fw-semibold text-mono">' + (p.wait || '') + '</div>' +
        '</div>' +
        '<div class="d-flex align-items-center"><button class="btn btn-sm btn-outline-c" data-assign-bed="1" data-er-id="' + (p.id || '') + '">Assign Bed</button></div>' +
      '</div>';
    }).join('');
  }

  // initial load
  loadQueueFromBackend();

  /* ---- mock AI scoring heuristic
     Weighs abnormal vitals + high-risk symptom keywords into an ESI-style
     1–5 acuity level. This stands in for the trained triage model API call. */
  function computeAcuity() {
    var hr = parseFloat(document.getElementById('tHr').value) || null;
    var rr = parseFloat(document.getElementById('tRr').value) || null;
    var spo2 = parseFloat(document.getElementById('tSpo2').value) || null;
    var temp = parseFloat(document.getElementById('tTemp').value) || null;
    var bp = parseFloat(document.getElementById('tBp').value) || null;
    var pain = parseFloat(document.getElementById('tPain').value) || 0;
    var symptoms = Array.prototype.slice.call(document.querySelectorAll('#symptomChips input:checked')).map(function (c) { return c.value; });

    var score = 0; // higher = more severe
    var reasons = [];

    if (spo2 !== null && spo2 < 90) { score += 4; reasons.push('SpO₂ critically low (' + spo2 + '%)'); }
    else if (spo2 !== null && spo2 < 94) { score += 2; reasons.push('SpO₂ below normal (' + spo2 + '%)'); }

    if (hr !== null && (hr > 130 || hr < 45)) { score += 3; reasons.push('Heart rate markedly abnormal (' + hr + ' bpm)'); }
    else if (hr !== null && (hr > 110 || hr < 55)) { score += 1; reasons.push('Heart rate elevated/low (' + hr + ' bpm)'); }

    if (bp !== null && bp < 90) { score += 3; reasons.push('Hypotensive (systolic ' + bp + ' mmHg)'); }
    if (rr !== null && (rr > 28 || rr < 10)) { score += 2; reasons.push('Respiratory rate abnormal (' + rr + '/min)'); }
    if (temp !== null && temp >= 39.5) { score += 2; reasons.push('High-grade fever (' + temp + '°C)'); }

    if (pain >= 8) { score += 1; reasons.push('Severe pain reported (' + pain + '/10)'); }

    var highRisk = ['Chest pain', 'Difficulty breathing', 'Severe bleeding', 'Loss of consciousness'];
    var midRisk = ['High fever', 'Fracture / trauma'];
    symptoms.forEach(function (s) {
      if (highRisk.indexOf(s) > -1) { score += 3; reasons.push('High-risk symptom: ' + s); }
      else if (midRisk.indexOf(s) > -1) { score += 1; reasons.push('Moderate-risk symptom: ' + s); }
      else { reasons.push('Reported: ' + s); }
    });

    var level;
    if (score >= 8) level = 1;
    else if (score >= 5) level = 2;
    else if (score >= 3) level = 3;
    else if (score >= 1) level = 4;
    else level = 5;

    return { level: level, reasons: reasons, score: score };
  }

  document.getElementById('runAiBtn').addEventListener('click', async function () {
    var name = document.getElementById('tName').value;
    if (!name) {
      document.getElementById('tName').classList.add('is-invalid');
      hisToast('Enter a patient name or ID first.', 'danger');
      return;
    }

    try {
      var payload = {
        hr: parseFloat(document.getElementById('tHr').value) || null,
        rr: parseFloat(document.getElementById('tRr').value) || null,
        spo2: parseFloat(document.getElementById('tSpo2').value) || null,
        temp: parseFloat(document.getElementById('tTemp').value) || null,
        bp: parseFloat(document.getElementById('tBp').value) || null,
        pain: parseFloat(document.getElementById('tPain').value) || 0,
        symptoms: Array.prototype.slice.call(document.querySelectorAll('#symptomChips input:checked')).map(function (c) { return c.value; })
      };

      // backend score
      var resp = await window.hisApi.post('/api/triage/score', payload);
      var level = resp.level;
      var reasons = Array.isArray(resp.reasons) ? resp.reasons : [];
      var confidence = resp.confidence;

      var m = acuityMeta[level];
      var body = document.getElementById('aiResultBody');
      var reasonsHtml = reasons.length
        ? '<ul class="mb-0 mt-2" style="font-size:.8rem;">' + reasons.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>'
        : '<div class="text-muted-c mt-2" style="font-size:.8rem;">No high-risk indicators detected from vitals/symptoms entered.</div>';

      body.innerHTML =
        '<div class="d-flex align-items-center gap-2 mb-1">' +
          '<span class="acuity ' + m.cls + '" style="font-size:.8rem;">' + m.label + '</span>' +
          '<span class="text-muted-c" style="font-size:.75rem;">confidence score ' + (confidence ?? Math.min(99, 60 + (reasons.length * 2))) + '%</span>' +
        '</div>' +
        '<div style="font-size:.82rem;">' + m.action + '</div>' +
        reasonsHtml;

      document.getElementById('aiResult').classList.remove('d-none');
      document.getElementById('aiResult').dataset.level = String(level);
      document.getElementById('confirmQueueBtn').classList.remove('d-none');
    } catch (e) {
      hisToast(String(e && e.message ? e.message : e), 'danger');
    }
  });

  // Assign Bed (placeholder UI hook)
  var queueHolder = document.getElementById('erQueue');
  if (queueHolder) {
    queueHolder.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-assign-bed]');
      if (!btn) return;

      var erId = btn.getAttribute('data-er-id') || '';
      hisToast('Assign Bed clicked for ' + erId + '. Backend endpoint not implemented yet.', 'info');
    });
  }

  var confirmBtn = document.getElementById('confirmQueueBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async function () {
    try {
      var level = parseInt(document.getElementById('aiResult').dataset.level, 10);
      var name = document.getElementById('tName').value || 'Patient';
      var complaint = Array.prototype.slice.call(document.querySelectorAll('#symptomChips input:checked')).map(function (c) { return c.value; }).join(', ') || 'General complaint';

      var payload = {
        name: name,
        complaint: complaint,
        level: level,
        vitals: {
          hr: document.getElementById('tHr').value || null,
          rr: document.getElementById('tRr').value || null,
          spo2: document.getElementById('tSpo2').value || null,
          temp: document.getElementById('tTemp').value || null,
          bp: document.getElementById('tBp').value || null,
          pain: document.getElementById('tPain').value || null
        },
        symptoms: Array.prototype.slice.call(document.querySelectorAll('#symptomChips input:checked')).map(function (c) { return c.value; })
      };

      // persist to backend
      await window.hisApi.post('/api/triage/queue', payload);

      // reload queue from backend (already unwrapped by hisApi.get)
      var qResp = await window.hisApi.get('/api/triage/queue');
      queue = Array.isArray(qResp) ? qResp : [];
      renderQueue();

      // close modal + reset UI
      (function () {
        var modalEl = document.getElementById('intakeModal');
        if (!modalEl || !window.bootstrap?.Modal) return;
        var inst = window.bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
        else {
          try { new window.bootstrap.Modal(modalEl).hide(); } catch (e) {}
        }
      })();

      document.getElementById('intakeForm').reset();
      document.getElementById('aiResult').classList.add('d-none');
      document.getElementById('confirmQueueBtn').classList.add('d-none');

      hisToast('Patient added to ER queue at <strong>' + acuityMeta[level].label + '</strong>.', level <= 2 ? 'danger' : 'success');
    } catch (e) {
      hisToast(String(e && e.message ? e.message : e), 'danger');
    }
    });
  }
})();
