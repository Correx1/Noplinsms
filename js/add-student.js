// Add Student Logic
(function() {
    // Photo Preview
    const photoInput = document.getElementById('student-photo');
    const photoPreview = document.getElementById('photo-preview');

    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Make switchTab global so inline onclicks work
    window.switchTab = function(tabId) {
        // 1. Hide all tab contents
        const allContents = document.querySelectorAll('#studentTabContent > div[role="tabpanel"]');
        allContents.forEach(content => {
            content.classList.add('hidden');
            content.style.display = 'none';
        });

        // 2. Deactivate all tab buttons
        const allButtons = document.querySelectorAll('#studentTabs button[role="tab"]');
        allButtons.forEach(btn => {
            btn.classList.remove('text-primary-600', 'border-primary-600', 'active', 'dark:text-primary-500', 'dark:border-primary-500');
            btn.classList.add('border-transparent');
            btn.setAttribute('aria-selected', 'false');
        });

        // 3. Show target content
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.style.setProperty('display', 'block', 'important');
        }

        // 4. Activate clicked button
        const tabButton = document.getElementById(tabId + '-tab');
        if (tabButton) {
            tabButton.classList.add('text-primary-600', 'border-primary-600', 'active', 'dark:text-primary-500', 'dark:border-primary-500');
            tabButton.classList.remove('border-transparent');
            tabButton.setAttribute('aria-selected', 'true');
        }
    }

    // Show debug message
    const debugMsg = document.getElementById('debug-msg');
    if(debugMsg) debugMsg.classList.remove('hidden');

    // Remove legacy event listener since we use inline now
    // document.body.addEventListener('click', ... );

    // Auto-select Personal Info tab on load
    setTimeout(() => {
        const personalTab = document.getElementById('personal-tab');
        if (personalTab) personalTab.click();
        
        // Re-init Datepickers explicitly
         if (typeof Datepicker !== 'undefined') {
            const datepickers = document.querySelectorAll('[datepicker]');
            datepickers.forEach(dp => {
                new Datepicker(dp, {
                     autohide: true,
                     format: 'mm/dd/yyyy'
                }); 
            });
        }
    }, 100);

    // Generic File Listener Function
    function addFileListener(inputId) {
        const input = document.getElementById(inputId);
        const fileList = document.getElementById('file-list');
        
        if (input && fileList) {
            input.addEventListener('change', function(e) {
                // Clear "No files" text if present
                if (fileList.querySelector('p.italic')) {
                    fileList.innerHTML = '';
                }

                const files = Array.from(e.target.files);
                
                files.forEach(file => {
                    const div = document.createElement('div');
                    div.className = 'flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600';
                    div.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-file-alt text-gray-400"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">${file.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${(file.size / 1024).toFixed(2)} KB - <span class="uppercase">${inputId.replace('file_', '').replace('_', ' ')}</span></p>
                            </div>
                        </div>
                        <button type="button" class="text-red-500 hover:text-red-700 remove-file">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    div.querySelector('.remove-file').addEventListener('click', function() {
                        div.remove();
                        if (fileList.children.length === 0) {
                             fileList.innerHTML = '<p class="text-sm text-gray-500 italic">No files selected yet.</p>';
                        }
                    });

                    fileList.appendChild(div);
                });
            });
        }
    }

    // Initialize listeners
    addFileListener('file_birth_cert');
    addFileListener('file_transfer_cert');
    addFileListener('file_photos');
    addFileListener('file_other');

    // Form Submission
    const form = document.getElementById('addStudentForm');
    const toast = document.getElementById('toast-success');
    
    // Section Dropdown Logic
    const classSelect = document.getElementById('class_select');
    const sectionSelect = document.getElementById('section_select');

    if (classSelect && sectionSelect) {
        const sections = {
            'JSS1': ['A', 'B', 'C', 'D'],
            'JSS2': ['A', 'B', 'C', 'D'],
            'JSS3': ['A', 'B', 'C', 'D'],
            'SS1': ['Science', 'Art', 'Commercial'],
            'SS2': ['Science', 'Art', 'Commercial'],
            'SS3': ['Science', 'Art', 'Commercial']
        };

        classSelect.addEventListener('change', function() {
            const selectedClass = this.value;
            sectionSelect.innerHTML = '<option value="">Select Section</option>'; // Reset

            if (selectedClass && sections[selectedClass]) {
                sections[selectedClass].forEach(sec => {
                    const option = document.createElement('option');
                    option.value = sec;
                    option.textContent = sec;
                    sectionSelect.appendChild(option);
                });
            } else {
                 // Default sections if not defined
                 ['A', 'B', 'C'].forEach(sec => {
                    const option = document.createElement('option');
                    option.value = sec;
                    option.textContent = sec;
                    sectionSelect.appendChild(option);
                });
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic Validation Check
            if (!form.checkValidity()) {
                // Browser default validation will handle UI, but we can add custom if needed
                return;
            }

            // Simulate API Call
            const submitBtn = document.getElementById('save-student-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';

            setTimeout(() => {
                // Show Success Toast
                toast.classList.remove('hidden');
                
                // Reset form
                form.reset();
                photoPreview.src = "https://ui-avatars.com/api/?name=New+Student&background=random";
                fileList.innerHTML = '';
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Hide toast after 3 seconds
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 3000);
            }, 1500);
        });
    }
    // Check for Edit Mode
    if (window.editingStudentId) {
        console.log("Editing Student:", window.editingStudentId);
        enableEditMode(window.editingStudentId);
    }

    function enableEditMode(id) {
        // 1. Update UI Text
        document.querySelector('h1').textContent = 'Edit Student';
        const breadcrumbSpan = document.querySelector('nav ol li:last-child span');
        if(breadcrumbSpan) breadcrumbSpan.textContent = 'Edit Student';
        
        const saveBtn = document.getElementById('save-student-btn');
        if(saveBtn) saveBtn.innerHTML = 'Update Student <i class="fas fa-check ml-2"></i>';
        
        // 2. Fetch Data (Mocking with student-details.json)
        fetch('../../data/student-details.json')
            .then(res => res.json())
            .then(data => {
                populateForm(data);
            })
            .catch(err => console.error(err));
    }

    function populateForm(data) {
        // Personal
        setVal('first_name', data.name.split(' ')[0]);
        setVal('last_name', data.name.split(' ')[1] || '');
        setVal('email', data.personal.email);
        setVal('phone', data.personal.phone);
        setVal('dob', data.personal.dob);
        setVal('blood_group', data.personal.blood_group);
        setVal('religion', data.personal.religion);
        setVal('address', data.personal.address);
        setVal('city', data.personal.city);
        setVal('state', data.personal.state);
        setVal('postal_code', data.personal.postal_code);
        
        // Radio Gender
        if(data.personal.gender === 'Male') document.getElementById('gender-male').checked = true;
        if(data.personal.gender === 'Female') document.getElementById('gender-female').checked = true;
        
        // Image
        if(data.photo) document.getElementById('photo-preview').src = data.photo;

        // Parents
        setVal('father_name', data.parents.father.name);
        setVal('father_phone', data.parents.father.phone);
        setVal('father_email', data.parents.father.email);
        setVal('father_occupation', data.parents.father.occupation);
        
        setVal('mother_name', data.parents.mother.name);
        setVal('mother_phone', data.parents.mother.phone);
        setVal('mother_email', data.parents.mother.email);
        setVal('mother_occupation', data.parents.mother.occupation);
        
        setVal('emergency_phone', data.parents.emergency_contact);

        // Academic
        setVal('academic_year', data.academic.academic_year);
        setVal('admission_date', data.academic.admission_date);
        setVal('class_select', data.academic.class);
        
        // Trigger class change to populate sections, then set section
        const classSelect = document.getElementById('class_select');
        if(classSelect) {
             const event = new Event('change');
             classSelect.dispatchEvent(event);
             setTimeout(() => setVal('section_select', data.academic.section), 50);
        }
        
        setVal('roll_no', data.academic.roll_no);
        setVal('previous_school', data.academic.previous_school);
        setVal('previous_class', data.academic.previous_class);
    }

    function setVal(id, value) {
        const el = document.getElementById(id);
        if(el) el.value = value;
    }

})();
