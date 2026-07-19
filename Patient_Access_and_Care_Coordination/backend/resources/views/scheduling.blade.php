<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scheduling · ASS</title>
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
    <a href="{{ route('scheduling') }}" class="menu-item active"><i class="bi bi-calendar2-week-fill"></i> Scheduling</a>
    <a href="{{ route('telehealth') }}" class="menu-item"><i class="bi bi-camera-video-fill"></i> Telehealth</a>
    <a href="{{ route('triage') }}" class="menu-item"><i class="bi bi-activity"></i> ER Triage</a>
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
        <div class="dashboard-subtitle" style="margin-bottom:6px;">ASS</div>
        <h1 class="dashboard-title" style="font-size:28px;margin-bottom:0;">Appointment &amp; Scheduling</h1>
      </div>
    </div>
    <div class="navbar-right">
      <button class="nav-btn" aria-label="New Appointment" data-nav-action="new-appointment"><i class="bi bi-plus-lg"></i></button>
    </div>
  </header>

  <main class="page-content">

    <!-- New Appointment Modal -->
    <div class="modal fade" id="newApptModal" tabindex="-1" aria-labelledby="newApptModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="newApptModalLabel">Book New Appointment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="apptForm" class="needs-validation" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="patientName">Patient</label>
                  <input type="text" class="form-control" id="patientName" name="patient" placeholder="Patient name" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="physician">Physician</label>
                  <select class="form-select" id="physician" name="physician" required>
                    <option value="">Select...</option>
                    <option value="Dr. Ahmed">Dr. Ahmed</option>
                    <option value="Dr. Khan">Dr. Khan</option>
                    <option value="Dr. Lee">Dr. Lee</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label" for="apptDate">Date</label>
                  <input type="date" class="form-control" id="apptDate" name="apptDate" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="apptTime">Time</label>
                  <input type="time" class="form-control" id="apptTime" name="apptTime" required>
                </div>

                <div class="col-12">
                  <div class="mb-2">
                    <label class="form-label d-block">Visit type</label>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="visitType" id="vt1" value="inperson" checked>
                      <label class="form-check-label" for="vt1">In-person</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="visitType" id="vt2" value="tele">
                      <label class="form-check-label" for="vt2">Telehealth</label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-c" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-accent" id="saveApptBtn">Save appointment</button>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-table">
      <div class="table-header">
        <div>
          <h4>Week</h4>
          <p>Appointments grid.</p>
        </div>
        <div class="btn-group" role="group" aria-label="Week navigation">
          <button type="button" class="btn btn-outline-c btn-sm" aria-label="Previous week"><i class="bi bi-chevron-left"></i></button>
          <button type="button" class="btn btn-outline-c btn-sm">Today</button>
          <button type="button" class="btn btn-outline-c btn-sm" aria-label="Next week"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table text-center" style="min-width:900px;">
          <thead>
            <tr>
              <th style="width:70px;">Time</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
            </tr>
          </thead>
          <tbody id="weekGrid"></tbody>
        </table>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-5">
        <div class="dashboard-table">
          <div class="table-header">
            <div>
              <h4>Today's appointments</h4>
              <p></p>
            </div>
            <span class="status pending" id="todayCount">0</span>
          </div>
          <div class="table-responsive" style="max-height:340px;">
            <div id="todayList"></div>
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="dashboard-table">
          <div class="table-header">
            <div>
              <h4>Doctor availability</h4>
              <p>Availability loaded from backend.</p>
            </div>
          </div>
          <div class="table-responsive" style="max-height:240px;overflow:auto;">
            <div>Doctor availability will be loaded from backend.</div>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/apiClient.js"></script>
<script src="assets/js/scheduling.js"></script>

</body>
</html>

