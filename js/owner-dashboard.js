// Run immediately since script is dynamically loaded
(function() {
    // Check if we are on the owner dashboard
    const revCanvas = document.getElementById('ownerRevenueChart');
    if (!revCanvas) return;

    // Initialize Revenue by Branch Chart
    const ctxRevenue = revCanvas.getContext('2d');
    
    // Check dark mode for text color
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Main Campus Revenue (M)',
                    data: [42, 45, 40, 50, 52, 56],
                    backgroundColor: '#2563eb',
                    borderRadius: 4
                },
                {
                    label: 'Lekki Annex Revenue (M)',
                    data: [15, 18, 16, 20, 21, 22],
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4
                },
                {
                    label: 'Abuja Revenue (M)',
                    data: [4, 5, 5, 8, 4, 4],
                    backgroundColor: '#14b8a6',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, padding: 20 }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    stacked: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });

    // Initialize Population Pie Chart
    const popCanvas = document.getElementById('ownerPopulationChart');
    if (popCanvas) {
        const ctxPop = popCanvas.getContext('2d');
        new Chart(ctxPop, {
            type: 'doughnut',
            data: {
                labels: ['Main Campus', 'Lekki Annex', 'Abuja Branch'],
                datasets: [{
                    data: [2242, 863, 345],
                    backgroundColor: [
                        '#2563eb', // Blue
                        '#8b5cf6', // Indigo
                        '#14b8a6'  // Teal
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false // We use custom legends underneath
                    }
                }
            }
        });
    }

    // Filter Logic Mock
    const filterSelect = document.getElementById('owner-branch-filter');
    const branchDataStore = {
        'all': { income: '₦428.5M', incLabel: '+14.2%', stu: '3,450', stuLabel: '+5.8%', tea: '215', teaLabel: '+12', stk: '86', stkLabel: 'Stable' },
        'main': { income: '₦285.4M', incLabel: '+8.1%', stu: '2,242', stuLabel: '+2.1%', tea: '156', teaLabel: '+4', stk: '42', stkLabel: 'Good' },
        'lekki': { income: '₦112.8M', incLabel: '+22.4%', stu: '863', stuLabel: '+14.5%', tea: '45', teaLabel: '+6', stk: '20', stkLabel: 'Hiring' },
        'abuja': { income: '₦30.3M', incLabel: '-4.2%', stu: '345', stuLabel: '-1.1%', tea: '14', teaLabel: '+2', stk: '24', stkLabel: 'Review' }
    };

    if(filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const data = branchDataStore[val];
            
            // In a real app, this triggers an API call that re-hydrates the cards and charts.
            // For now, we simulate a loading state
            filterSelect.disabled = true;
            document.body.style.cursor = 'wait';
            
            setTimeout(() => {
                filterSelect.disabled = false;
                document.body.style.cursor = 'default';
                
                if (data) {
                    const incEl = document.getElementById('kpi-income');
                    const stuEl = document.getElementById('kpi-students');
                    const teaEl = document.getElementById('kpi-teachers');
                    const stkEl = document.getElementById('kpi-staff');
                    
                    if(incEl) incEl.innerText = data.income;
                    if(stuEl) stuEl.innerText = data.stu;
                    if(teaEl) teaEl.innerText = data.tea;
                    if(stkEl) stkEl.innerText = data.stk;
                    
                    const incLb = document.getElementById('kpi-income-label');
                    const stuLb = document.getElementById('kpi-students-label');
                    const teaLb = document.getElementById('kpi-teachers-label');
                    const stkLb = document.getElementById('kpi-staff-label');
                    
                    if(incLb) incLb.innerText = data.incLabel;
                    if(stuLb) stuLb.innerText = data.stuLabel;
                    if(teaLb) teaLb.innerText = data.teaLabel;
                    if(stkLb) stkLb.innerText = data.stkLabel;
                }

                // Toast notification
                const toastStr = `Dashboard data updated for: ${e.target.options[e.target.selectedIndex].text}`;
                if (typeof showToast === 'function') {
                    showToast(toastStr, 'success');
                } else {
                    console.log(toastStr);
                }
            }, 500);
        });
    }
})();
