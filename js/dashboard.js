document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on the dashboard page and have the main content container
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Load Dashboard Home
    await loadDashboardHome();

    async function loadDashboardHome() {
        try {
            const response = await fetch('dashboard-home.html'); // Sibling file
            if (!response.ok) throw new Error('Failed to load dashboard home');
            const html = await response.text();
            mainContent.innerHTML = html;

            // Fetch Data
            const dataResponse = await fetch('../../data/dashboard-data.json'); // Root data
            const data = await dataResponse.json();

            // Populate Data
            populateSummary(data.summary);
            populateAttendance(data.attendance);
            populateFinance(data.finance);
            populateActivities(data.recentActivities);
            populateEvents(data.events);
            
            // Initialize Charts
            initCharts(data.charts);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            mainContent.innerHTML = '<p class="text-red-500">Error loading dashboard content.</p>';
        }
    }

    function populateSummary(summary) {
        document.getElementById('count-students').innerText = summary.students;
        document.getElementById('count-teachers').innerText = summary.teachers;
        document.getElementById('count-staff').innerText = summary.staff;
        document.getElementById('count-classes').innerText = summary.classes;
    }

   function populateAttendance(attendance) {
    const circle = document.getElementById('attendance-circle');
    const radius = 56;
    const circumference = 2 * Math.PI * radius;

    if (circle) {
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference;
      circle.style.transition = 'stroke-dashoffset 0.8s ease-out';

      requestAnimationFrame(() => {
        circle.style.strokeDashoffset =
          circumference - (attendance.percentage / 100) * circumference;
      });
    }

    document.getElementById('attendance-percent').innerText =
      `${attendance.percentage}%`;
    document.getElementById('attendance-present').innerText =
      attendance.present;
    document.getElementById('attendance-absent').innerText =
      attendance.absent;
  }

    function populateFinance(finance) {
        document.getElementById('finance-income').innerText = `${finance.currency}${finance.income.toLocaleString()}`;
        document.getElementById('finance-expense').innerText = `${finance.currency}${finance.expense.toLocaleString()}`;
    }

    function populateActivities(activities) {
        const list = document.getElementById('recent-activities-list');
        list.innerHTML = activities.map(activity => `
            <li class="mb-4 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">${activity.time}</time>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">${activity.text}</h3>
            </li>
        `).join('');
    }

    function populateEvents(events) {
        const list = document.getElementById('events-list');
        list.innerHTML = events.map(event => `
             <li class="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div class="flex-shrink-0 text-center px-2 border-r border-gray-300 dark:border-gray-600">
                    <span class="block text-xs font-bold text-gray-500 uppercase">${new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span class="block text-lg font-bold text-gray-800 dark:text-gray-300">${new Date(event.date).getDate()}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate dark:text-white">${event.title}</p>
                    <p class="text-xs text-gray-500 truncate dark:text-gray-400">${event.time}</p>
                </div>
            </li>
        `).join('');
    }

    function initCharts(chartData) {
        // Enrollment Chart
        const ctxEnrollment = document.getElementById('enrollmentChart').getContext('2d');
        new Chart(ctxEnrollment, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Students Enrolled',
                    data: chartData.enrollment,
                    backgroundColor: 'rgb(37, 99, 235)',
                    borderColor: 'rgb(37, 99, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Attendance Chart with center text
        const ctxAttendance = document.getElementById('attendanceChart').getContext('2d');
        
        // Plugin to add text in center of doughnut
        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function(chart) {
                if (chart.config.type === 'doughnut') {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    ctx.restore();
                    
                    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const presentValue = chart.data.datasets[0].data[0];
                    const percentage = Math.round((presentValue / total) * 100);
                    
                    const fontSize = (height / 114).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937';
                    
                    const text = percentage + "%";
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2;
                    
                    ctx.fillText(text, textX, textY - 10);
                    
                    // Add "Present" label below
                    ctx.font = (fontSize * 0.4) + "em sans-serif";
                    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
                    const labelText = "Present";
                    const labelX = Math.round((width - ctx.measureText(labelText).width) / 2);
                    ctx.fillText(labelText, labelX, textY + 15);
                    
                    ctx.save();
                }
            }
        };
        
        new Chart(ctxAttendance, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'On Leave'],
                datasets: [{
                    data: chartData.attendance,
                    backgroundColor: [
                        'rgb(34, 197, 94)',
                        'rgb(239, 68, 68)',
                        'rgb(234, 179, 8)'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            plugins: [centerTextPlugin]
        });
    }
});
