// Initialize Dummy Data for Score Sheets and Results
(function() {
    console.log('Initializing dummy data for academics...');

    // Check if dummy data already exists
    if (localStorage.getItem('examsData') && localStorage.getItem('dummyDataInitialized')) {
        console.log('Dummy data already initialized');
        return;
    }

    // Dummy Exams Data
    const examsData = [
        {
            id: 'EXAM001',
            name: 'First Term Examination 2024',
            term: 'First Term',
            year: '2023/2024',
            startDate: '2024-03-15',
            endDate: '2024-03-25'
        },
        {
            id: 'EXAM002',
            name: 'Second Term Examination 2024',
            term: 'Second Term',
            year: '2023/2024',
            startDate: '2024-07-10',
            endDate: '2024-07-20'
        },
        {
            id: 'EXAM003',
            name: 'Third Term Examination 2024',
            term: 'Third Term',
            year: '2023/2024',
            startDate: '2024-11-05',
            endDate: '2024-11-15'
        }
    ];

    // Dummy Assessments Data
    const assessmentsData = [
        {
            id: 'ASSESS001',
            title: 'Mid-Term Test - Mathematics',
            subject: 'Mathematics',
            date: '2024-02-15',
            maxScore: 50
        },
        {
            id: 'ASSESS002',
            title: 'Class Assignment - English',
            subject: 'English Language',
            date: '2024-02-20',
            maxScore: 30
        }
    ];

    // Save to localStorage
    localStorage.setItem('examsData', JSON.stringify(examsData));
    localStorage.setItem('assessmentsData', JSON.stringify(assessmentsData));
    localStorage.setItem('dummyDataInitialized', 'true');

    console.log('✅ Dummy exams and assessments data initialized!');
    console.log('Exams:', examsData.length);
    console.log('Assessments:', assessmentsData.length);
})();
