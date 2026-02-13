$template = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{0} - School Management System</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div id="header-container"></div>
  <div id="sidebar-container"></div>
  <div class="p-4 lg:ml-64 mt-14">
    <div class="p-4">
      <div id="breadcrumb-container"></div>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">{0}</h1>
      <div class="card"><p>{0} page content</p></div>
    </div>
  </div>
  <script type="module">
    import Auth from '/js/auth.js';
    import Utils from '/js/utils.js';
    import Sidebar from '/js/sidebar.js';
    import Breadcrumb from '/js/breadcrumb.js';
    Auth.protectPage();
    async function init() {
      await Utils.loadComponent('header-container', '/components/header.html');
      await Utils.loadComponent('sidebar-container', '/components/sidebar.html');
      await Utils.loadComponent('breadcrumb-container', '/components/breadcrumb.html');
      setTimeout(() => { Sidebar.init(); Breadcrumb.generate(); }, 100);
    }
    init();
  </script>
</body>
</html>
'@

$pages = @(
    @{Path="pages\admin\academics\promote-students.html"; Title="Promote Students"},
    @{Path="pages\admin\academics\assessments.html"; Title="Assessments"},
    @{Path="pages\admin\academics\examinations.html"; Title="Examinations"},
    @{Path="pages\admin\academics\score-sheets.html"; Title="Score Sheets"},
    @{Path="pages\admin\academics\marks.html"; Title="Marks"},
    @{Path="pages\admin\academics\results.html"; Title="Results"},
    @{Path="pages\admin\attendance\student-attendance.html"; Title="Student Attendance"},
    @{Path="pages\admin\attendance\staff-attendance.html"; Title="Staff Attendance"},
    @{Path="pages\admin\finance\income.html"; Title="Income"},
    @{Path="pages\admin\finance\expenses.html"; Title="Expenses"},
    @{Path="pages\admin\record\visitors-log.html"; Title="Visitors Log"},
    @{Path="pages\admin\record\phone-log.html"; Title="Phone Log"},
    @{Path="pages\admin\record\email-logs.html"; Title="Email Logs"},
    @{Path="pages\admin\record\sms-logs.html"; Title="SMS Logs"},
    @{Path="pages\admin\events.html"; Title="Events"},
    @{Path="pages\admin\notices.html"; Title="Notices"},
    @{Path="pages\admin\library.html"; Title="Library"},
    @{Path="pages\admin\transportation.html"; Title="Transportation"},
    @{Path="pages\admin\hostel.html"; Title="Hostel"},
    @{Path="pages\admin\reports.html"; Title="Reports"},
    @{Path="pages\admin\settings\profile.html"; Title="Profile"},
    @{Path="pages\admin\settings\users.html"; Title="Users"}
)

foreach ($page in $pages) {
    $content = $template -f $page.Title
    $fullPath = Join-Path $PWD $page.Path
    $dir = Split-Path $fullPath -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $content | Out-File -FilePath $fullPath -Encoding UTF8
    Write-Host "Created: $($page.Path)"
}

Write-Host "All pages created successfully!"
