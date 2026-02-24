// Teacher Pages Functionality
// This file contains all the interactive functionality for teacher pages

// ==================== ATTENDANCE PAGE ====================
window.attendanceData = {
    'JSS 2A': [
        {rollNo: '001', name: 'John Doe'},
        {rollNo: '002', name: 'Jane Smith'},
        {rollNo: '003', name: 'David Brown'},
        {rollNo: '004', name: 'Sarah Williams'},
        {rollNo: '005', name: 'Michael Johnson'}
    ],
    'SSS 1B': [
        {rollNo: '101', name: 'Alice Cooper'},
        {rollNo: '102', name: 'Bob Martin'},
        {rollNo: '103', name: 'Carol White'}
    ],
    'SSS 2A': [
        {rollNo: '201', name: 'Emma Davis'},
        {rollNo: '202', name: 'Frank Miller'},
        {rollNo: '203', name: 'Grace Lee'}
    ]
};

window.initAttendancePage = function() {
    // Set today's date
    const dateInput = document.getElementById('attendanceDate');
    if(dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Fetch Students Form
    const form = document.getElementById('fetchStudentsForm');
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedClass = document.getElementById('classSelect').value;
            
            if(!selectedClass) {
                alert('Please select a class');
                return;
            }
            
            const students = window.attendanceData[selectedClass] || [];
            const tbody = document.getElementById('attendanceTableBody');
            tbody.innerHTML = '';
            
            students.forEach(student => {
                const row = `
                    <tr class="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${student.rollNo}</td>
                        <td class="px-6 py-4 text-gray-900 dark:text-white">${student.name}</td>
                        <td class="px-6 py-4">
                            <div class="flex space-x-4">
                                <div class="flex items-center">
                                    <input type="radio" name="att_${student.rollNo}" value="present" checked onchange="updateAttendanceCounts()" class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500">
                                    <label class="ml-2 text-sm font-medium text-green-700">Present</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="radio" name="att_${student.rollNo}" value="absent" onchange="updateAttendanceCounts()" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500">
                                    <label class="ml-2 text-sm font-medium text-red-700">Absent</label>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <input type="text" id="remarks_${student.rollNo}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 w-full" placeholder="Optional remarks">
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
            
            document.getElementById('selectedClass').textContent = selectedClass;
            document.getElementById('attendanceTableContainer').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';
            updateAttendanceCounts();
        });
    }
};

window.updateAttendanceCounts = function() {
    const radios = document.querySelectorAll('input[type="radio"]:checked');
    let present = 0, absent = 0;
    
    radios.forEach(radio => {
        if(radio.value === 'present') present++;
        else if(radio.value === 'absent') absent++;
    });
    
    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    const totalEl = document.getElementById('totalCount');
    
    if(presentEl) presentEl.textContent = present;
    if(absentEl) absentEl.textContent = absent;
    if(totalEl) totalEl.textContent = present + absent;
};

// Alias for HTML onchange handlers
window.updateCounts = window.updateAttendanceCounts;


window.markAllPresent = function() {
    const presentRadios = document.querySelectorAll('input[type="radio"][value="present"]');
    presentRadios.forEach(radio => radio.checked = true);
    updateAttendanceCounts();
};

window.saveAttendance = function() {
    const classVal = document.getElementById('classSelect')?.value;
    const date = document.getElementById('attendanceDate')?.value;
    
    if(!classVal || !date) {
        alert('Please select class and date');
        return;
    }
    
    alert('Attendance saved successfully!');
};

// ==================== GRADE BOOK PAGE ====================
window.gradeStudentData = {
    'JSS 2A': [
        {rollNo: '001', name: 'John Doe'},
        {rollNo: '002', name: 'Jane Smith'},
        {rollNo: '003', name: 'David Brown'},
        {rollNo: '004', name: 'Sarah Williams'},
        {rollNo: '005', name: 'Michael Johnson'}
    ],
    'SSS 1B': [
        {rollNo: '101', name: 'Alice Cooper'},
        {rollNo: '102', name: 'Bob Martin'},
        {rollNo: '103', name: 'Carol White'}
    ],
    'SSS 2A': [
        {rollNo: '201', name: 'Emma Davis'},
        {rollNo: '202', name: 'Frank Miller'},
        {rollNo: '203', name: 'Grace Lee'}
    ]
};

window.initGradeBookPage = function() {
    const form = document.getElementById('loadGradesForm');
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedClass = document.getElementById('gradeClassSelect').value;
            const subject = document.getElementById('gradeSubjectSelect').value;
            const assessment = document.getElementById('gradeAssessmentSelect').value;
            
            if(!selectedClass) {
                alert('Please select a class');
                return;
            }
            
            const students = window.gradeStudentData[selectedClass] || [];
            const tbody = document.getElementById('gradeTableBody');
            tbody.innerHTML = '';
            
            students.forEach(student => {
                const row = `
                    <tr class="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">${student.rollNo}</td>
                        <td class="px-4 py-4 text-gray-900 dark:text-white">${student.name}</td>
                        <td class="px-4 py-4">
                            <input type="number" min="0" max="70" id="theory_${student.rollNo}" onchange="calculateTotal('${student.rollNo}')" class="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="0">
                        </td>
                        <td class="px-4 py-4">
                            <input type="number" min="0" max="10" id="assess1_${student.rollNo}" onchange="calculateTotal('${student.rollNo}')" class="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="0">
                        </td>
                        <td class="px-4 py-4">
                            <input type="number" min="0" max="10" id="assess2_${student.rollNo}" onchange="calculateTotal('${student.rollNo}')" class="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="0">
                        </td>
                        <td class="px-4 py-4">
                            <input type="number" min="0" max="10" id="assess3_${student.rollNo}" onchange="calculateTotal('${student.rollNo}')" class="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="0">
                        </td>
                        <td class="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                            <span id="total_${student.rollNo}">0</span>
                        </td>
                        <td class="px-4 py-4">
                            <span id="grade_${student.rollNo}" class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">-</span>
                        </td>
                        <td class="px-4 py-4">
                            <input type="text" id="remarks_${student.rollNo}" class="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="Remarks">
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
            
            document.getElementById('gradeTableTitle').textContent = `${selectedClass} - ${subject} - ${assessment}`;
            document.getElementById('gradeTableContainer').style.display = 'block';
            document.getElementById('gradeEmptyState').style.display = 'none';
            document.getElementById('gradeSummary').style.display = 'grid';
            
            updateGradeSummary();
        });
    }
};

window.calculateTotal = function(rollNo) {
    const theory = parseFloat(document.getElementById(`theory_${rollNo}`)?.value) || 0;
    const assess1 = parseFloat(document.getElementById(`assess1_${rollNo}`)?.value) || 0;
    const assess2 = parseFloat(document.getElementById(`assess2_${rollNo}`)?.value) || 0;
    const assess3 = parseFloat(document.getElementById(`assess3_${rollNo}`)?.value) || 0;
    
    const total = theory + assess1 + assess2 + assess3;
    const totalEl = document.getElementById(`total_${rollNo}`);
    if(totalEl) totalEl.textContent = total;
    
    // Calculate grade
    let grade = '-';
    let gradeClass = 'bg-gray-100 text-gray-800';
    
    if(total >= 90) { grade = 'A+'; gradeClass = 'bg-green-100 text-green-800'; }
    else if(total >= 80) { grade = 'A'; gradeClass = 'bg-green-100 text-green-800'; }
    else if(total >= 70) { grade = 'B'; gradeClass = 'bg-primary-100 text-primary-800'; }
    else if(total >= 60) { grade = 'C'; gradeClass = 'bg-yellow-100 text-yellow-800'; }
    else if(total >= 50) { grade = 'D'; gradeClass = 'bg-orange-100 text-orange-800'; }
    else if(total > 0) { grade = 'F'; gradeClass = 'bg-red-100 text-red-800'; }
    
    const gradeSpan = document.getElementById(`grade_${rollNo}`);
    if(gradeSpan) {
        gradeSpan.textContent = grade;
        gradeSpan.className = `px-2 py-1 ${gradeClass} text-xs font-medium rounded`;
    }
    
    updateGradeSummary();
};

window.updateGradeSummary = function() {
    const rows = document.querySelectorAll('#gradeTableBody tr');
    let total = rows.length;
    let graded = 0;
    let totalMarks = 0;
    
    rows.forEach(row => {
        const totalCell = row.querySelector('td:nth-child(7) span');
        if(totalCell) {
            const marks = parseFloat(totalCell.textContent);
            if(marks > 0) {
                graded++;
                totalMarks += marks;
            }
        }
    });
    
    const totalEl = document.getElementById('totalStudents');
    const gradedEl = document.getElementById('gradedCount');
    const pendingEl = document.getElementById('pendingCount');
    const avgEl = document.getElementById('classAverage');
    
    if(totalEl) totalEl.textContent = total;
    if(gradedEl) gradedEl.textContent = graded;
    if(pendingEl) pendingEl.textContent = total - graded;
    if(avgEl) avgEl.textContent = graded > 0 ? Math.round(totalMarks / graded) + '%' : '0%';
};

window.saveGrades = function() {
    alert('Grades saved successfully!');
};

// ==================== STUDENTS PAGE - MESSAGING ====================
let currentStudentRollNo = '';

window.openMessageModal = function(rollNo, name) {
    currentStudentRollNo = rollNo;
    const modal = document.getElementById('messageModal');
    const toInput = document.getElementById('messageTo');
    
    if(toInput) toInput.value = name + ' (Roll No: ' + rollNo + ')';
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeMessageModal = function() {
    const modal = document.getElementById('messageModal');
    const form = document.getElementById('messageForm');
    
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if(form) form.reset();
};

window.sendMessage = function(event) {
    event.preventDefault();
    const subject = document.getElementById('messageSubject')?.value;
    const body = document.getElementById('messageBody')?.value;
    const to = document.getElementById('messageTo')?.value;
    
    console.log('Sending message to:', currentStudentRollNo, {subject, body});
    alert('Message sent successfully to ' + to);
    closeMessageModal();
};

window.viewStudent = function(rollNo) {
    alert('View student profile: ' + rollNo);
};

// ==================== EXAMS PAGE ====================
window.examQuestions = {
    'math_midterm': [],
    'physics_final': [],
    'chemistry_practical': []
};

window.initExamsPage = function() {
    // Initialize question type change handler
    const questionType = document.getElementById('questionType');
    if(questionType) {
        questionType.addEventListener('change', function() {
            const objOptions = document.getElementById('objectiveOptions');
            if(objOptions) {
                objOptions.style.display = this.value === 'Objective' ? 'block' : 'none';
            }
        });
    }
    
    // Initialize add question form
    const form = document.getElementById('addQuestionForm');
    if(form) {
        form.addEventListener('submit', saveQuestion);
    }
};

window.switchTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id$="Tab"]').forEach(el => {
        el.classList.remove('text-primary-600', 'border-primary-600');
        el.classList.add('border-transparent');
    });
    
    if(tab === 'upcoming') {
        document.getElementById('upcomingContent')?.classList.remove('hidden');
        document.getElementById('upcomingTab')?.classList.add('text-primary-600', 'border-primary-600');
    } else if(tab === 'questions') {
        document.getElementById('questionsContent')?.classList.remove('hidden');
        document.getElementById('questionsTab')?.classList.add('text-primary-600', 'border-primary-600');
    }
};

window.manageQuestions = function(examName) {
    switchTab('questions');
    const examMap = {
        'Mathematics Mid-Term Exam': 'math_midterm',
        'Physics Final Exam': 'physics_final',
        'Chemistry Practical Test': 'chemistry_practical'
    };
    const select = document.getElementById('examSelect');
    if(select) {
        select.value = examMap[examName];
        loadExamQuestions();
    }
};

window.loadExamQuestions = function() {
    const examId = document.getElementById('examSelect')?.value;
    if(!examId) {
        document.getElementById('questionsList').style.display = 'none';
        document.getElementById('questionsEmptyState').style.display = 'block';
        return;
    }
    
    const examTitles = {
        'math_midterm': 'Mathematics Mid-Term Exam',
        'physics_final': 'Physics Final Exam',
        'chemistry_practical': 'Chemistry Practical Test'
    };
    
    const titleEl = document.getElementById('examTitle');
    if(titleEl) titleEl.textContent = examTitles[examId];
    
    document.getElementById('questionsList').style.display = 'block';
    document.getElementById('questionsEmptyState').style.display = 'none';
    
    const questions = window.examQuestions[examId];
    const container = document.getElementById('questionsContainer');
    
    if(!container) return;
    
    if(questions.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No questions added yet. Click "Add Question" to create questions for this exam.</p>';
    } else {
        container.innerHTML = questions.map((q, index) => `
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-900 dark:text-white">Question ${q.number} (${q.marks} marks)</h4>
                    <button onclick="deleteQuestion('${examId}', ${index})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="text-gray-700 mb-2">${q.text}</p>
                ${q.options ? `
                    <div class="text-sm text-gray-600 ml-4">
                        <p>A. ${q.options.A}</p>
                        <p>B. ${q.options.B}</p>
                        <p>C. ${q.options.C}</p>
                        <p>D. ${q.options.D}</p>
                        <p class="mt-1 text-green-600 font-medium">Correct Answer: ${q.correctAnswer}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
};

window.openAddQuestionModal = function() {
    const examId = document.getElementById('examSelect')?.value;
    if(!examId) {
        alert('Please select an exam first');
        return;
    }
    
    const questionType = document.getElementById('questionType')?.value;
    const objOptions = document.getElementById('objectiveOptions');
    if(objOptions) {
        objOptions.style.display = questionType === 'Objective' ? 'block' : 'none';
    }
    
    const modal = document.getElementById('addQuestionModal');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeAddQuestionModal = function() {
    const modal = document.getElementById('addQuestionModal');
    const form = document.getElementById('addQuestionForm');
    
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if(form) form.reset();
};

window.saveQuestion = function(event) {
    event.preventDefault();
    const examId = document.getElementById('examSelect')?.value;
    const questionType = document.getElementById('questionType')?.value;
    
    const question = {
        number: document.getElementById('questionNumber')?.value,
        text: document.getElementById('questionText')?.value,
        marks: document.getElementById('questionMarks')?.value,
        type: questionType
    };
    
    if(questionType === 'Objective') {
        question.options = {
            A: document.getElementById('optionA')?.value,
            B: document.getElementById('optionB')?.value,
            C: document.getElementById('optionC')?.value,
            D: document.getElementById('optionD')?.value
        };
        question.correctAnswer = document.getElementById('correctAnswer')?.value;
    }
    
    window.examQuestions[examId].push(question);
    console.log('Question added:', question);
    alert('Question added successfully!');
    closeAddQuestionModal();
    loadExamQuestions();
};

window.deleteQuestion = function(examId, index) {
    if(confirm('Are you sure you want to delete this question?')) {
        window.examQuestions[examId].splice(index, 1);
        loadExamQuestions();
    }
};

// ==================== MY CLASSES PAGE ====================
window.viewClassStudents = function(className, subject) {
    // Navigate to students page with filters
    window.loadTeacherStudents();
    setTimeout(() => {
        const classSelect = document.getElementById('classSelect');
        if(classSelect) classSelect.value = className;
    }, 200);
};

window.markClassAttendance = function(className, subject) {
    // Navigate to attendance page with pre-filled class
    window.loadTeacherAttendance();
    setTimeout(() => {
        const classSelect = document.getElementById('classSelect');
        if(classSelect) classSelect.value = className;
    }, 200);
};

window.viewClassAssignments = function(className, subject) {
    // Navigate to assignments page
    window.loadTeacherAssignments();
    setTimeout(() => {
        alert(`Viewing assignments for ${className} - ${subject}`);
    }, 200);
};
