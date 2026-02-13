// Add dummy scores to localStorage for testing
(function() {
    console.log('Adding dummy scores for testing...');

    // Check if scores already exist
    if (localStorage.getItem('dummyScoresAdded')) {
        console.log('Dummy scores already added');
        return;
    }

    // Dummy scores for SS3 - Mathematics - First Term Exam
    const ss3MathScores = {
        'STU001': { theory: '65', prac: '28', remarks: 'Excellent performance' },
        'STU002': { theory: '58', prac: '25', remarks: 'Good work' },
        'STU003': { theory: '62', prac: '27', remarks: 'Very good' },
        'STU014': { theory: '55', prac: '22', remarks: 'Satisfactory' },
        'STU020': { theory: '68', prac: '29', remarks: 'Outstanding' }
    };

    // Dummy scores for SS3 - English Language - First Term Exam
    const ss3EnglishScores = {
        'STU001': { theory: '60', prac: '26', remarks: 'Good' },
        'STU002': { theory: '63', prac: '27', remarks: 'Very good' },
        'STU003': { theory: '58', prac: '24', remarks: 'Good' },
        'STU014': { theory: '52', prac: '20', remarks: 'Fair' },
        'STU020': { theory: '65', prac: '28', remarks: 'Excellent' }
    };

    // Dummy scores for SS3 - Physics - First Term Exam
    const ss3PhysicsScores = {
        'STU001': { theory: '62', prac: '27', remarks: 'Very good' },
        'STU002': { theory: '60', prac: '26', remarks: 'Good' },
        'STU003': { theory: '64', prac: '28', remarks: 'Excellent' },
        'STU014': { theory: '50', prac: '19', remarks: 'Fair' },
        'STU020': { theory: '66', prac: '29', remarks: 'Outstanding' }
    };

    // Dummy scores for SS3 - Chemistry - First Term Exam
    const ss3ChemistryScores = {
        'STU001': { theory: '58', prac: '25', remarks: 'Good' },
        'STU002': { theory: '61', prac: '26', remarks: 'Very good' },
        'STU003': { theory: '59', prac: '25', remarks: 'Good' },
        'STU014': { theory: '48', prac: '18', remarks: 'Needs improvement' },
        'STU020': { theory: '64', prac: '28', remarks: 'Excellent' }
    };

    // Dummy scores for SS3 - Biology - First Term Exam
    const ss3BiologyScores = {
        'STU001': { theory: '63', prac: '27', remarks: 'Very good' },
        'STU002': { theory: '59', prac: '25', remarks: 'Good' },
        'STU003': { theory: '61', prac: '26', remarks: 'Very good' },
        'STU014': { theory: '53', prac: '21', remarks: 'Satisfactory' },
        'STU020': { theory: '67', prac: '29', remarks: 'Outstanding' }
    };

    // Save to localStorage
    localStorage.setItem('scores_EXAM:EXAM001_SS3_Mathematics', JSON.stringify(ss3MathScores));
    localStorage.setItem('scores_EXAM:EXAM001_SS3_English Language', JSON.stringify(ss3EnglishScores));
    localStorage.setItem('scores_EXAM:EXAM001_SS3_Physics', JSON.stringify(ss3PhysicsScores));
    localStorage.setItem('scores_EXAM:EXAM001_SS3_Chemistry', JSON.stringify(ss3ChemistryScores));
    localStorage.setItem('scores_EXAM:EXAM001_SS3_Biology', JSON.stringify(ss3BiologyScores));
    
    // Mark as added
    localStorage.setItem('dummyScoresAdded', 'true');

    console.log('✅ Dummy scores added for SS3 - First Term Examination 2024');
    console.log('Subjects: Mathematics, English Language, Physics, Chemistry, Biology');
})();
