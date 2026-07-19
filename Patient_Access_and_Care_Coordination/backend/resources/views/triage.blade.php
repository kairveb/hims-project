<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ER Triage · EERTS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="sidebar-backdrop d-none position-fixed top-0 start-0 w-100 h-100" style="background:rgba(0,0,0,.4);z-index:1025;"></div>

<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="logo-box">MC</div>
    <div>
      <h5>MedCore HIS</h5>
      <small>Care Coordination</small>
    </div>
  </div>

  <nav class="sidebar-menu">
    <a href="{{ route('dashboard') }}" class="menu-item"><i class="bi bi-grid-1x2-fill"></i> Dashboard</a>
    <a href="{{ route('registration') }}" class="menu-item"><i class="bi bi-person-vcard-fill"></i> Registration</a>
    <a href="{{ route('scheduling') }}" class="menu-item"><i class="bi bi-calendar2-week-fill"></i> Scheduling</a>
    <a href="{{ route('telehealth') }}" class="menu-item"><i class="bi bi-camera-video-fill"></i> Telehealth</a>
    <a href="{{ route('triage') }}" class="menu-item active"><i class="bi bi-activity"></i> ER Triage</a>
    <a href="{{ route('bed-management') }}" class="menu-item"><i class="bi bi-hospital-fill"></i> Bed Management</a>
  </nav>

  <div class="sidebar-footer">
    <div>Signed in as <strong>—</strong><br>Front Desk · Shift —</div>
  </div>
</aside>

<div class="main-content">
  <header class="top-navbar">
    <button class="nav-btn sidebar-toggle d-lg-none" aria-label="Toggle menu"><i class="bi bi-list"></i></button>
    <div>
      <div class="dashboard-header" style="margin-bottom:0;display:inline-block;vertical-align:middle;margin-left:14px;">
        <div class="dashboard-subtitle" style="margin-bottom:6px;">EERTS</div>
        <h1 class="dashboard-title" style="font-size:28px;margin-bottom:0;">Emergency &amp; ER Triage</h1>
      </div>
    </div>
    <div class="navbar-right">
      <button class="nav-btn" aria-label="New ER Intake" data-bs-toggle="modal" data-bs-target="#intakeModal"><i class="bi bi-plus-lg"></i></button>
    </div>
  </header>

  <main class="page-content">

    <div class="row g-3 dashboard-stats">
      <div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-card-header"><div class="stat-icon"><i class="bi bi-lightning-fill"></i></div><span class="stat-badge danger">L1</span></div><div class="stat-value">—</div><div class="stat-label">Level 1 · Critical</div></div></div>
      <div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-card-header"><div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div><span class="stat-badge pending">L2</span></div><div class="stat-value">—</div><div class="stat-label">Level 2 · Emergent</div></div></div>
      <div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-card-header"><div class="stat-icon"><i class="bi bi-clock-fill"></i></div><span class="stat-badge active">L3</span></div><div class="stat-value">—</div><div class="stat-label">Avg door-to-triage</div></div></div>
      <div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-card-header"><div class="stat-icon"><i class="bi bi-hospital-fill"></i></div><span class="stat-badge active">L4</span></div><div class="stat-value">—</div><div class="stat-label">ER bays occupied</div></div></div>
    </div>

    <div class="dashboard-table mt-4">
      <div class="table-header">
        <div>
          <h4>ER queue</h4>
          <p><i class="bi bi-cpu me-1"></i>Waiting for backend</p>
        </div>
      </div>
      <div id="erQueue"></div>
    </div>

    <!-- New ER Intake / AI Triage Modal -->
    <div class="modal fade" id="intakeModal" tabindex="-1" aria-labelledby="intakeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="intakeModalLabel">New ER Intake · AI Triage</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="intakeForm">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label" for="tName">Patient name / ID</label>
                  <input type="text" class="form-control" id="tName" placeholder="e.g. Juan Dela Cruz">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="tPain">Pain level (0–10)</label>
                  <input type="number" min="0" max="10" class="form-control" id="tPain">
                </div>

                <div class="col-md-4">
                  <label class="form-label" for="tHr">Heart rate (bpm)</label>
                  <input type="number" class="form-control" id="tHr">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="tRr">Resp. rate (/min)</label>
                  <input type="number" class="form-control" id="tRr">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="tSpo2">SpO₂ (%)</label>
                  <input type="number" class="form-control" id="tSpo2">
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="tTemp">Temperature (°C)</label>
                  <input type="number" step="0.1" class="form-control" id="tTemp">
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="tBp">Systolic BP (mmHg)</label>
                  <input type="number" class="form-control" id="tBp">
                </div>

                <div class="col-12">
                  <label class="form-label d-block">Symptoms</label>
                  <div id="symptomChips" class="d-flex flex-wrap gap-3">
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-chest" value="Chest pain">
                      <label class="form-check-label" for="sym-chest">Chest pain</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-breath" value="Difficulty breathing">
                      <label class="form-check-label" for="sym-breath">Difficulty breathing</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-bleed" value="Severe bleeding">
                      <label class="form-check-label" for="sym-bleed">Severe bleeding</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-loc" value="Loss of consciousness">
                      <label class="form-check-label" for="sym-loc">Loss of consciousness</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-fever" value="High fever">
                      <label class="form-check-label" for="sym-fever">High fever</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-fracture" value="Fracture / trauma">
                      <label class="form-check-label" for="sym-fracture">Fracture / trauma</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-nausea" value="Nausea / vomiting">
                      <label class="form-check-label" for="sym-nausea">Nausea / vomiting</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="sym-headache" value="Severe headache">
                      <label class="form-check-label" for="sym-headache">Severe headache</label>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div class="mt-3">
              <button type="button" class="btn btn-accent" id="runAiBtn"><i class="bi bi-cpu me-1"></i> Run AI triage</button>
            </div>

            <div id="aiResult" class="mt-3 d-none">
              <div id="aiResultBody"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-c" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-accent d-none" id="confirmQueueBtn">Confirm &amp; add to queue</button>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/apiClient.js"></script>
<script src="assets/js/triage.js"></script>




</body>
</html>

