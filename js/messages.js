// js/messages.js
(function() {
    console.log('Communication Messages Module Loaded');

    let classesData = [];
    let studentsList = [];
    let staffList = [];
    let selectedIndividuals = [];
    let savedTemplates = [];
    let dispatchLogs = [];

    const STORAGE_TEMPLATES_KEY = 'sms_communication_templates';
    const STORAGE_LOGS_KEY = 'sms_communication_dispatch_logs';

    const DEFAULT_PRESET_TEMPLATES = [
        {
            id: 'TPL_COMM_1',
            title: 'School Fees Reminder',
            type: 'email',
            subject: 'Urgent Notice: Term School Fees Outstanding Reminder',
            body: 'Dear Parent,\n\nWe would like to remind you that your child\'s outstanding school fees are due. The total fee assigned for the active term must be cleared prior to examinations.\n\nPlease find the details of outstanding bills and transaction logs on your parent dashboard.\n\nThank you,\nAdministration Office.'
        },
        {
            id: 'TPL_COMM_2',
            title: 'Result Release Notification',
            type: 'email',
            subject: 'Academic Performance Results Released',
            body: 'Dear Parents,\n\nThis is to officially inform you that the report cards and results for the current academic term have been approved and published.\n\nYou can log into the student-parent portal to check positions, averages, and grades, and download print-ready result PDFs.\n\nWarm regards,\nAcademic Registry.'
        },
        {
            id: 'TPL_COMM_3',
            title: 'Late Clock-in Warning',
            type: 'sms',
            subject: '',
            body: 'Parent Alert: Your child {{name}} clocked in late to school today. Please ensure they arrive before 7:45 AM.'
        },
        {
            id: 'TPL_COMM_4',
            title: 'Emergency Day Closure',
            type: 'sms',
            subject: '',
            body: 'Important: Greenfield Academy will be closed tomorrow due to localized weather warning. Online classes will operate via portal. Check notices board for link.'
        }
    ];

    const DEFAULT_DISPATCH_LOGS = [
        {
            id: 'LOG_1',
            timestamp: '2026-07-10 09:15:32',
            recipients: 'All Parents',
            channel: 'email',
            subject: 'Term 3 Resumption Notification',
            body: 'Dear Parents, this is to inform you that school resumes on the 15th of September...',
            status: 'Sent'
        },
        {
            id: 'LOG_2',
            timestamp: '2026-07-11 08:30:10',
            recipients: 'Staff Members',
            channel: 'sms',
            subject: '',
            body: 'Reminder: Staff General Meeting in Assembly Hall today at 2:00 PM prompt. Attendance is mandatory.',
            status: 'Sent'
        },
        {
            id: 'LOG_3',
            timestamp: '2026-07-12 07:45:00',
            recipients: 'JSS 1 Parents',
            channel: 'email',
            subject: 'PTA Levy Invoice Out',
            body: 'This is to inform all parents of JSS 1 students that the PTA levy is now active...',
            status: 'Queued'
        }
    ];

    async function init() {
        try {
            // Load DB and lists
            const classesRes = await fetch('../../data/classes-data.json');
            classesData = await classesRes.json();

            // Populate Classes Selection
            const targetClassesSelect = document.getElementById('target-classes');
            if (targetClassesSelect) {
                targetClassesSelect.innerHTML = '<option value="All">All Classes (No Class Filter)</option>';
                classesData.forEach(cls => {
                    targetClassesSelect.innerHTML += `<option value="${cls.name}">${cls.name}</option>`;
                });
            }

            // Load Students and Staff list
            const rawStudents = localStorage.getItem('sms_students');
            if (rawStudents) studentsList = JSON.parse(rawStudents);
            else studentsList = window.SchoolDatabase?.students || [];

            staffList = window.SchoolDatabase?.staff || [];

            // Seed Templates
            const storedTpls = localStorage.getItem(STORAGE_TEMPLATES_KEY);
            if (storedTpls) {
                savedTemplates = JSON.parse(storedTpls);
            } else {
                savedTemplates = DEFAULT_PRESET_TEMPLATES;
                localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(savedTemplates));
            }

            // Seed Logs
            const storedLogs = localStorage.getItem(STORAGE_LOGS_KEY);
            if (storedLogs) {
                dispatchLogs = JSON.parse(storedLogs);
            } else {
                dispatchLogs = DEFAULT_DISPATCH_LOGS;
                localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(dispatchLogs));
            }

            // Init dropdown selections
            populatePresetTemplatesDropdown();
            renderTemplatesGrid();
            renderDispatchLogs();

            // Form Submit Listener
            const composeForm = document.getElementById('msg-compose-form');
            if (composeForm) {
                composeForm.addEventListener('submit', handleBroadcastSend);
            }

            // Template Editor Form Submit Listener
            const tplForm = document.getElementById('tpl-editor-form');
            if (tplForm) {
                tplForm.addEventListener('submit', handleSaveTemplate);
            }

        } catch (e) {
            console.error('Error during messaging module initialization:', e);
        }
    }

    // ── TABS NAVIGATION ──
    window.switchMsgTab = function(tabName) {
        const tabs = ['compose', 'logs', 'templates'];
        tabs.forEach(t => {
            const pane = document.getElementById(`tab-${t}`);
            const btn = document.getElementById(`${t}-tab-btn`);
            if (t === tabName) {
                pane.classList.remove('hidden');
                btn.className = "inline-block p-4 border-b-2 rounded-t-lg text-primary-600 border-primary-600 active dark:text-primary-500 dark:border-primary-500 font-bold";
            } else {
                pane.classList.add('hidden');
                btn.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300";
            }
        });
    };

    // ── FORM HELPERS ──
    window.toggleChannelFields = function(channel) {
        const subjectPane = document.getElementById('field-email-subject');
        const counterPane = document.getElementById('sms-counter-pane');
        const emailLabel = document.getElementById('channel-email-label');
        const smsLabel = document.getElementById('channel-sms-label');

        if (channel === 'email') {
            subjectPane.classList.remove('hidden');
            counterPane.classList.add('hidden');
            emailLabel.className = "flex items-center justify-center p-3 border-2 border-primary-500 bg-primary-50/50 rounded-lg cursor-pointer dark:bg-primary-900/10 dark:border-primary-500 group select-none";
            smsLabel.className = "flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 dark:border-gray-600 group select-none";
            
            // Set text body input required or clear limit
            document.getElementById('msg-body').placeholder = "Type your message body here... Use {{name}} to dynamically placeholder student names.";
        } else {
            subjectPane.classList.add('hidden');
            counterPane.classList.remove('hidden');
            emailLabel.className = "flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 dark:border-gray-600 group select-none";
            smsLabel.className = "flex items-center justify-center p-3 border-2 border-primary-500 bg-primary-50/50 rounded-lg cursor-pointer dark:bg-primary-900/10 dark:border-primary-500 group select-none";
            
            document.getElementById('msg-body').placeholder = "Type your SMS body here... Keep it concise.";
            countSmsChars();
        }
        populatePresetTemplatesDropdown();
    };

    window.toggleSchedulePane = function() {
        const scheduleType = document.getElementById('msg-schedule').value;
        const datetimePane = document.getElementById('schedule-datetime-pane');
        if (scheduleType === 'later') {
            datetimePane.classList.remove('hidden');
            // Set default date time to now + 1 hour
            const now = new Date();
            now.setHours(now.getHours() + 1);
            document.getElementById('msg-schedule-time').value = now.toISOString().slice(0, 16);
        } else {
            datetimePane.classList.add('hidden');
        }
    };

    window.countSmsChars = function() {
        const channel = document.querySelector('input[name="msg-channel"]:checked').value;
        if (channel !== 'sms') return;

        const bodyVal = document.getElementById('msg-body').value;
        const totalChars = bodyVal.length;
        document.getElementById('sms-char-count').textContent = totalChars;
        
        // standard page character threshold (160)
        const pages = Math.ceil(totalChars / 160) || 1;
        document.getElementById('sms-pages-count').textContent = pages;
    };

    // ── RECIPIENTS SEARCH LOGIC ──
    window.suggestIndividualRecipients = function() {
        const searchInput = document.getElementById('individual-search').value.toLowerCase().trim();
        const suggContainer = document.getElementById('individual-suggestions');

        if (!searchInput) {
            suggContainer.classList.add('hidden');
            return;
        }

        // Search both student list and staff list
        const matches = [];

        studentsList.forEach(s => {
            if (s.name.toLowerCase().includes(searchInput) || (s.id && s.id.toLowerCase().includes(searchInput))) {
                matches.push({ id: s.id, name: s.name, type: 'Student', details: s.class || '' });
            }
        });

        staffList.forEach(st => {
            if (st.name.toLowerCase().includes(searchInput) || (st.id && st.id.toLowerCase().includes(searchInput))) {
                matches.push({ id: st.id, name: st.name, type: 'Staff', details: st.employment?.designation || 'Teacher' });
            }
        });

        const filteredMatches = matches.filter(match => !selectedIndividuals.some(sel => sel.id === match.id)).slice(0, 5);

        if (filteredMatches.length === 0) {
            suggContainer.innerHTML = '<li class="p-2.5 text-center text-gray-500">No results found</li>';
        } else {
            suggContainer.innerHTML = filteredMatches.map(m => `
                <li onclick="addIndividualRecipientTag('${m.id}', '${m.name}', '${m.type}')" class="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center">
                    <div>
                        <strong class="text-gray-900 dark:text-white font-bold">${m.name}</strong>
                        <span class="text-xs text-gray-400 block">${m.id} &bull; ${m.details}</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">${m.type}</span>
                </li>
            `).join('');
        }

        suggContainer.classList.remove('hidden');
    };

    window.addIndividualRecipientTag = function(id, name, type) {
        selectedIndividuals.push({ id, name, type });
        document.getElementById('individual-search').value = '';
        document.getElementById('individual-suggestions').classList.add('hidden');
        renderRecipientTags();
    };

    window.removeRecipientTag = function(id) {
        selectedIndividuals = selectedIndividuals.filter(sel => sel.id !== id);
        renderRecipientTags();
    };

    function renderRecipientTags() {
        const container = document.getElementById('selected-recipients-tags');
        if (!container) return;

        if (selectedIndividuals.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = selectedIndividuals.map(item => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-800">
                <i class="${item.type === 'Student' ? 'fas fa-user-graduate':'fas fa-user-tie'} opacity-70"></i>
                ${item.name}
                <button type="button" onclick="window.removeRecipientTag('${item.id}')" class="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 text-primary-800 dark:text-primary-300 font-black">
                    <i class="fas fa-times text-[10px]"></i>
                </button>
            </span>
        `).join('');
    }

    // ── PRESET TEMPLATE SELECTOR ──
    function populatePresetTemplatesDropdown() {
        const select = document.getElementById('msg-preset-template');
        if (!select) return;

        const currentChannel = document.querySelector('input[name="msg-channel"]:checked').value;
        const filtered = savedTemplates.filter(t => t.type === currentChannel);

        select.innerHTML = '<option value="">-- Apply Template (None) --</option>';
        filtered.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.title}</option>`;
        });
    }

    window.applyPresetMessage = function() {
        const tplId = document.getElementById('msg-preset-template').value;
        if (!tplId) return;

        const template = savedTemplates.find(t => t.id === tplId);
        if (template) {
            const bodyArea = document.getElementById('msg-body');
            const subjectField = document.getElementById('msg-subject');

            bodyArea.value = template.body;
            if (template.type === 'email' && subjectField) {
                subjectField.value = template.subject || '';
            }
            countSmsChars();
        }
    };

    // ── BROADCASING & MOCK SENDING ──
    function handleBroadcastSend(e) {
        e.preventDefault();

        // 1. Channel
        const channel = document.querySelector('input[name="msg-channel"]:checked').value;
        
        // 2. Body & Subject
        const body = document.getElementById('msg-body').value.trim();
        const subject = channel === 'email' ? document.getElementById('msg-subject').value.trim() : '';

        // 3. Targets
        const targetStuds = document.getElementById('target-students').checked;
        const targetParents = document.getElementById('target-parents').checked;
        const targetTeachers = document.getElementById('target-teachers').checked;
        const classFilter = document.getElementById('target-classes').value;

        // Build target description string
        let targetsArr = [];
        if (targetStuds) targetsArr.push('Students');
        if (targetParents) targetsArr.push('Parents');
        if (targetTeachers) targetsArr.push('Teachers & Staff');
        
        if (classFilter !== 'All') {
            targetsArr = targetsArr.map(t => `${classFilter} ${t}`);
        }

        selectedIndividuals.forEach(ind => {
            targetsArr.push(ind.name);
        });

        if (targetsArr.length === 0) {
            alert('Please select at least one Target Group or add direct individual recipients.');
            return;
        }

        const recipientsSummary = targetsArr.join(', ');
        
        // 4. Scheduling
        const scheduleVal = document.getElementById('msg-schedule').value;
        const scheduleTime = scheduleVal === 'later' ? document.getElementById('msg-schedule-time').value : 'Now';

        const newLog = {
            id: 'LOG_' + Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            recipients: recipientsSummary,
            channel: channel,
            subject: subject,
            body: body,
            status: scheduleVal === 'later' ? 'Queued' : 'Sent'
        };

        // Insert into logs
        dispatchLogs.unshift(newLog);
        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(dispatchLogs));

        // Reset Form
        document.getElementById('msg-compose-form').reset();
        selectedIndividuals = [];
        renderRecipientTags();
        document.getElementById('schedule-datetime-pane').classList.add('hidden');
        
        // Update Logs view
        renderDispatchLogs();

        // Show Success Toast
        showSuccessNotification(channel, scheduleVal === 'later');

        // Automatically switch tabs to view outbox logs
        setTimeout(() => {
            switchMsgTab('logs');
        }, 1200);
    }

    function showSuccessNotification(channel, isScheduled) {
        const toast = document.getElementById('toast-message');
        const text = document.getElementById('toast-message-text');
        const iconContainer = document.getElementById('toast-message-icon');

        if (isScheduled) {
            text.innerHTML = `Message dispatch scheduled for later execution queue.`;
            iconContainer.innerHTML = '<i class="fas fa-clock text-green-500 text-lg"></i>';
        } else {
            text.innerHTML = `${channel.toUpperCase()} broadcast sent successfully to queue!`;
            iconContainer.innerHTML = '<i class="fas fa-check-circle text-green-500 text-lg"></i>';
        }

        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    }

    // ── DISPATCH LOGS RENDERING ──
    window.renderDispatchLogs = function() {
        const tbody = document.getElementById('dispatch-logs-tbody');
        if (!tbody) return;

        const searchQuery = document.getElementById('log-search').value.toLowerCase();
        const channelFilter = document.getElementById('log-channel-filter').value;
        const statusFilter = document.getElementById('log-status-filter').value;

        let filtered = dispatchLogs;

        if (channelFilter !== 'All') {
            filtered = filtered.filter(log => log.channel === channelFilter);
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(log => log.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(log => 
                log.recipients.toLowerCase().includes(searchQuery) ||
                (log.subject && log.subject.toLowerCase().includes(searchQuery)) ||
                log.body.toLowerCase().includes(searchQuery)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-gray-500 dark:text-gray-400">
                        <i class="fas fa-history text-3xl opacity-30 mb-2 block"></i>
                        No dispatch logs found matching active filters.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(log => {
            const statusClass = {
                Sent: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800',
                Queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                Failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800'
            }[log.status] || 'bg-gray-100 text-gray-800';

            const channelBadge = log.channel === 'email' 
                ? '<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><i class="fas fa-envelope mr-1 text-[10px]"></i>Email</span>'
                : '<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"><i class="fas fa-sms mr-1 text-[10px]"></i>SMS</span>';

            return `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-semibold">${log.timestamp}</td>
                    <td class="px-6 py-4 max-w-xs truncate font-bold text-gray-900 dark:text-white" title="${log.recipients}">${log.recipients}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${channelBadge}</td>
                    <td class="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-gray-300">
                        <strong class="block text-gray-950 dark:text-white font-bold text-xs truncate">${log.subject || '(No Subject)'}</strong>
                        <span class="text-xs opacity-80 block truncate">${log.body}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2.5 py-0.5 rounded text-xs font-bold border ${statusClass}">${log.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <button onclick="viewLogModal('${log.id}')" class="text-xs font-bold px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 rounded-lg transition-colors">
                            <i class="fas fa-eye mr-1"></i>View Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // ── DETAILS LOG VIEW MODAL ──
    window.viewLogModal = function(id) {
        const log = dispatchLogs.find(l => l.id === id);
        if (!log) return;

        document.getElementById('modal-log-recipients').textContent = log.recipients;
        document.getElementById('modal-log-time').textContent = log.timestamp;
        
        const statusClass = {
            Sent: 'bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200',
            Queued: 'bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-200',
            Failed: 'bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded border border-red-200'
        }[log.status] || 'bg-gray-100 text-gray-800';
        document.getElementById('modal-log-status').className = statusClass;
        document.getElementById('modal-log-status').textContent = log.status;

        const chanBadge = log.channel === 'email' 
            ? 'bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded' 
            : 'bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded';
        document.getElementById('modal-log-channel').className = chanBadge;
        document.getElementById('modal-log-channel').textContent = log.channel.toUpperCase();

        if (log.channel === 'email') {
            document.getElementById('modal-log-subject-pane').classList.remove('hidden');
            document.getElementById('modal-log-subject').textContent = log.subject || '(No Subject)';
        } else {
            document.getElementById('modal-log-subject-pane').classList.add('hidden');
        }

        document.getElementById('modal-log-body').textContent = log.body;

        const modal = document.getElementById('log-view-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeLogModal = function() {
        const modal = document.getElementById('log-view-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // ── TEMPLATES MANAGER CRUD ──
    function renderTemplatesGrid() {
        const grid = document.getElementById('templates-grid-communication');
        if (!grid) return;

        if (savedTemplates.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    No templates saved yet.
                </div>
            `;
            return;
        }

        grid.innerHTML = savedTemplates.map(t => {
            const chanColor = t.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
            return `
                <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold px-2.5 py-0.5 rounded ${chanColor}">${t.type.toUpperCase()}</span>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="editCommunicationTemplate('${t.id}')" class="text-gray-500 hover:text-primary-600 p-1 text-sm"><i class="fas fa-edit"></i></button>
                                <button type="button" onclick="deleteCommunicationTemplate('${t.id}')" class="text-red-500 hover:text-red-700 p-1 text-sm"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate mb-1" title="${t.title}">${t.title}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">${t.body}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function handleSaveTemplate(e) {
        e.preventDefault();

        const id = document.getElementById('tpl-edit-id').value;
        const title = document.getElementById('tpl-title').value.trim();
        const type = document.getElementById('tpl-type').value;
        const subject = type === 'email' ? document.getElementById('tpl-subject').value.trim() : '';
        const body = document.getElementById('tpl-body').value.trim();

        if (!title || !body) return;

        if (id) {
            // Update
            const idx = savedTemplates.findIndex(t => t.id === id);
            if (idx !== -1) {
                savedTemplates[idx] = { id, title, type, subject, body };
            }
        } else {
            // Create
            const newTpl = {
                id: 'TPL_COMM_' + Date.now(),
                title,
                type,
                subject,
                body
            };
            savedTemplates.push(newTpl);
        }

        localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(savedTemplates));
        resetTemplateEditor();
        renderTemplatesGrid();
        populatePresetTemplatesDropdown();

        // Toast alert
        const toast = document.getElementById('toast-message');
        const text = document.getElementById('toast-message-text');
        text.textContent = 'Template configuration saved successfully!';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    }

    window.editCommunicationTemplate = function(id) {
        const tpl = savedTemplates.find(t => t.id === id);
        if (!tpl) return;

        document.getElementById('tpl-edit-id').value = tpl.id;
        document.getElementById('tpl-title').value = tpl.title;
        document.getElementById('tpl-type').value = tpl.type;
        document.getElementById('tpl-subject').value = tpl.subject || '';
        document.getElementById('tpl-body').value = tpl.body;

        document.getElementById('tpl-editor-title').textContent = 'Edit Preset Template';
    };

    window.deleteCommunicationTemplate = function(id) {
        if (!confirm('Are you sure you want to delete this preset template?')) return;

        savedTemplates = savedTemplates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(savedTemplates));
        
        renderTemplatesGrid();
        populatePresetTemplatesDropdown();
    };

    window.resetTemplateEditor = function() {
        document.getElementById('tpl-editor-form').reset();
        document.getElementById('tpl-edit-id').value = '';
        document.getElementById('tpl-editor-title').textContent = 'New Preset Template';
    };

    // Trigger loader on component fetch ready
    init();

})();
