// Result Settings JS Logic
(function() {
    console.log('Result Settings module initialized.');

    let domainsList = [
        "Discipline", "Neatness", "Attentiveness", "Punctuality", 
        "Logical", "Leadership", "Teamwork", "Attendance", "Sports"
    ];

    let b64PrincipalSign = "";
    let b64HeadteacherSign = "";

    function renderDomains() {
        const container = document.getElementById('domains-container');
        if(!container) return;
        
        container.innerHTML = '';
        domainsList.forEach((dom, idx) => {
            container.innerHTML += `
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 font-medium w-6 text-right">${idx + 1}.</span>
                    <input type="text" value="${dom}" class="domain-input-val bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    <button type="button" onclick="window.removeDomainField(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Domain">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    window.addNewDomainField = function() {
        domainsList.push("");
        renderDomains();
    };

    window.removeDomainField = function(idx) {
        domainsList.splice(idx, 1);
        renderDomains();
    };

    function handleFileUpload(inputId, previewId, setterCallback) {
        const input = document.getElementById(inputId);
        input.addEventListener('change', function() {
            const file = this.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const b64 = e.target.result;
                    setterCallback(b64);
                    const preview = document.getElementById(previewId);
                    preview.innerHTML = `<img src="${b64}" class="max-h-full max-w-full object-contain">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('globalResultSettings');
        if(savedSettings) {
            const data = JSON.parse(savedSettings);
            if(document.getElementById('rs-session')) document.getElementById('rs-session').value = data.session || '';
            if(document.getElementById('rs-resumption')) document.getElementById('rs-resumption').value = data.resumption || '';
            if(document.getElementById('rs-principal-name')) document.getElementById('rs-principal-name').value = data.principalName || '';
            if(document.getElementById('rs-headteacher-name')) document.getElementById('rs-headteacher-name').value = data.headteacherName || '';
            
            if(data.domains && Array.isArray(data.domains)) {
                domainsList = data.domains;
            }

            if(data.principalSign) {
                b64PrincipalSign = data.principalSign;
                document.getElementById('rs-principal-preview').innerHTML = `<img src="${b64PrincipalSign}" class="max-h-full max-w-full object-contain">`;
            }
            if(data.headteacherSign) {
                b64HeadteacherSign = data.headteacherSign;
                document.getElementById('rs-headteacher-preview').innerHTML = `<img src="${b64HeadteacherSign}" class="max-h-full max-w-full object-contain">`;
            }
        }
        renderDomains();

        // Bind File Uploads
        handleFileUpload('rs-principal-sign', 'rs-principal-preview', (val) => b64PrincipalSign = val);
        handleFileUpload('rs-headteacher-sign', 'rs-headteacher-preview', (val) => b64HeadteacherSign = val);
    }

    function saveSettings(e) {
        e.preventDefault();

        // Capture domains natively from DOM exactly as typed
        const domInputs = document.querySelectorAll('.domain-input-val');
        domainsList = Array.from(domInputs).map(inp => inp.value.trim()).filter(v => v !== "");

        const data = {
            session: document.getElementById('rs-session').value,
            resumption: document.getElementById('rs-resumption').value,
            principalName: document.getElementById('rs-principal-name').value,
            headteacherName: document.getElementById('rs-headteacher-name').value,
            domains: domainsList,
            principalSign: b64PrincipalSign,
            headteacherSign: b64HeadteacherSign
        };

        localStorage.setItem('globalResultSettings', JSON.stringify(data));

        alert('Global Result Settings updated successfully! Dynamic Domains and Signatures stored.');
        renderDomains(); // Refresh UI cleanly
    }

    // Bind Form
    setTimeout(() => {
        loadSettings();
        const form = document.getElementById('resultSettingsForm');
        if(form) form.addEventListener('submit', saveSettings);
    }, 100);

})();
