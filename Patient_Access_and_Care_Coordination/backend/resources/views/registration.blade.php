<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Patient Registration · SPRS</title>
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
    <a href="dashboard.html" class="menu-item"><i class="bi bi-grid-1x2-fill"></i> Dashboard</a>
    <a href="registration.html" class="menu-item active"><i class="bi bi-person-vcard-fill"></i> Registration</a>
    <a href="scheduling.html" class="menu-item"><i class="bi bi-calendar2-week-fill"></i> Scheduling</a>
    <a href="telehealth.html" class="menu-item"><i class="bi bi-camera-video-fill"></i> Telehealth</a>
    <a href="triage.html" class="menu-item"><i class="bi bi-activity"></i> ER Triage</a>
    <a href="bed-management.html" class="menu-item"><i class="bi bi-hospital-fill"></i> Bed Management</a>
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
        <div class="dashboard-subtitle" style="margin-bottom:6px;">SPRS</div>
        <h1 class="dashboard-title" style="font-size:28px;margin-bottom:0;">Smart Patient Registration</h1>
      </div>
    </div>

    <div class="navbar-right">
      <button class="nav-btn" aria-label="New Patient" data-nav-action="new-patient">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>
  </header>

  <main class="page-content">

    <!-- New Patient Modal -->
    <div class="modal fade" id="newPatientModal" tabindex="-1" aria-labelledby="newPatientModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="newPatientModalLabel">Register New Patient</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="registerForm" class="needs-validation" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="firstName">First name</label>
                  <input type="text" class="form-control" id="firstName" name="firstName" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="lastName">Last name</label>
                  <input type="text" class="form-control" id="lastName" name="lastName" required>
                </div>

                <div class="col-md-4">
                  <label class="form-label" for="age">Age</label>
                  <input type="number" min="0" max="130" class="form-control" id="age" name="age" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="sex">Sex</label>
                  <select class="form-select" id="sex" name="sex" required>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label" for="contact">Contact</label>
                  <input type="text" class="form-control" id="contact" name="contact" placeholder="Phone / ID" required>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-c" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-accent" id="saveRegistrationBtn">Save patient</button>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-3 col-6">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon"><i class="bi bi-person-plus-fill"></i></div>
            <span class="stat-badge active">Today</span>
          </div>
          <div class="stat-value" id="statToday">0</div>
          <div class="stat-label">Registered today</div>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <span class="stat-badge active">Total</span>
          </div>
          <div class="stat-value" id="statTotal">0</div>
          <div class="stat-label">Total records on file</div>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
            <span class="stat-badge pending">Queue</span>
          </div>
          <div class="stat-value" id="statQueue">0</div>
          <div class="stat-label">Waiting at front desk</div>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon"><i class="bi bi-shield-check"></i></div>
            <span class="stat-badge success">Verified</span>
          </div>
          <div class="stat-value">—</div>
          <div class="stat-label">ID verification success</div>
        </div>
      </div>
    </div>

    <div class="dashboard-table mt-4">
      <div class="table-header">
        <div>
          <h4>Patient records</h4>
          <p>Search and manage patient entries.</p>
        </div>
        <div class="d-flex gap-2">
          <input type="text" id="searchInput" class="form-control form-control-sm" placeholder="Search name or ID..." style="max-width:220px;">
          <select id="filterStatus" class="form-select form-select-sm" style="max-width:170px;">
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Admitted">Admitted</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table" id="patientTable">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age / Sex</th>
              <th>Contact</th>
              <th>Registered</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

  </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/apiClient.js"></script>
<script src="assets/js/registration.js"></script>

</body>
</html>

