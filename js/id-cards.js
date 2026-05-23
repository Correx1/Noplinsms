// Smart ID Cards Module — 10 High-Fidelity Radically Unique Templates (Dynamic Custom Fields, Variable Photo Positions & Custom Back-sides)
(function() {
    const CLASSES = ['JSS1A','JSS1B','JSS2A','JSS2B','JSS3A','JSS3B','SSS1A','SSS1B','SSS2A','SSS2B','SSS3A','SSS3B'];
    const FIRST_NAMES = ['Ada','Emeka','Chidi','Ngozi','Yemi','Tunde','Fatima','Ibrahim','Amara','Kelechi','Zainab','Seun','Biodun','Chiamaka','Okoro'];
    const LAST_NAMES = ['Okafor','Adeyemi','Nwachukwu','Bello','Eze','Adeleke','Musa','Ajibade','Okonkwo','Abubakar','Oluwole','Ihejirika','Osei','Afolabi','Nduka'];
    const PHOTOS = ['👧','👦','👩','👨','🧒'];

    const DEFAULT_CONFIG = {
        orientation: 'portrait',
        templateId: 1, 
        showPhoto: true,
        showDob: true,
        showBlood: true,
        showPhone: true,
        colorMode: 'global',       // 'global' | 'custom'
        cardCustomColor: '#0284c7',// used when colorMode === 'custom'
        showBarcode: false,
        customBackground: null,
        signatures: [
            { id: 'sig_default', name: '', title: 'School Principal' }
        ],
        customFields: [],
        rules: "This card is the official property of the school. If found, please return to the administration desk immediately. A replacement fee will be charged for lost cards."
    };

    // Load Design settings from Storage
    let studioConfig = JSON.parse(localStorage.getItem('sms_id_card_config') || JSON.stringify(DEFAULT_CONFIG));
    // Ensure all standard defaults exist
    if (!studioConfig.customFields) studioConfig.customFields = [...DEFAULT_CONFIG.customFields];
    if (!studioConfig.signatures) studioConfig.signatures = [...DEFAULT_CONFIG.signatures];
    if (!studioConfig.colorMode) studioConfig.colorMode = 'global';
    if (!studioConfig.cardCustomColor) studioConfig.cardCustomColor = '#0284c7';
    if (typeof studioConfig.showBarcode === 'undefined') studioConfig.showBarcode = false;
    if (typeof studioConfig.customBackground === 'undefined') studioConfig.customBackground = null;
    // Remove old legacy default custom fields if they exist in user's localStorage
    if (studioConfig.customFields.some(f => f.label === 'Bus Route' || f.label === 'Hostel')) {
        studioConfig.customFields = studioConfig.customFields.filter(f => f.label !== 'Bus Route' && f.label !== 'Hostel');
    }

    function loadStudents() {
        let sts = JSON.parse(localStorage.getItem('sms_students') || '[]');
        if (sts.length === 0) {
            let id = 1;
            CLASSES.forEach(cls => {
                const count = 10 + Math.floor(Math.random() * 5);
                for (let i = 0; i < count; i++) {
                    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                    sts.push({
                        id: `STU${String(id).padStart(4,'0')}`,
                        name: `${fn} ${ln}`,
                        className: cls,
                        session: '2024/2025',
                        dob: `${2005+Math.floor(Math.random()*5)}-${String(Math.ceil(Math.random()*12)).padStart(2,'0')}-${String(1+Math.floor(Math.random()*27)).padStart(2,'0')}`,
                        gender: Math.random() > 0.5 ? 'Male' : 'Female',
                        bloodGroup: ['A+','B+','O+','AB+','A-','O-'][Math.floor(Math.random()*6)],
                        emoji: PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
                        phone: `080${String(Math.floor(Math.random()*9e7+1e7))}`,
                        nfc_uid: Math.random() > 0.5 ? `NFC${Math.floor(Math.random()*89999+10000)}` : null
                    });
                    id++;
                }
            });
            localStorage.setItem('sms_students', JSON.stringify(sts));
        }
        return sts;
    }

    function saveStudents() {
        localStorage.setItem('sms_students', JSON.stringify(allStudents));
    }

    function getSchoolInfo() {
        const p = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
        return {
            name:    p.name    || p['school-name']    || 'Noplin Academy',
            address: p.address || p['school-address'] || '12 School Lane, Ikeja, Lagos',
            phone:   p.phone   || p['school-phone']   || '+234 801 234 5678',
            logo:    p.logo    || ''
        };
    }

    // Dynamic color picker fetching from global Theme settings
    function getThemeColor() {
        // If studio has custom color override active, use that
        if (studioConfig.colorMode === 'custom' && studioConfig.cardCustomColor) {
            return studioConfig.cardCustomColor;
        }

        // Fetch current active theme name
        const activeTheme = localStorage.getItem('selectedTheme') || 'blue';
        
        // Custom HSL calculation check
        if (activeTheme === 'custom') {
            return localStorage.getItem('customThemeColor') || '#3b82f6';
        }

        // Standard theme mapping
        const themeColors = {
            'blue': '#0284c7',
            'green': '#059669',
            'purple': '#9333ea',
            'red': '#e11d48',
            'teal': '#0d9488',
            'gold': '#d97706',
            'navy-blue': '#202B5D',
            'forest': '#043927',
            'ruby': '#C32644',
            'slate': '#475569'
        };
        return themeColors[activeTheme] || '#0284c7';
    }

    function getCardDates() {
        const now = new Date();
        const expiry = new Date();
        expiry.setFullYear(now.getFullYear() + 3);

        const options = { month: 'short', year: 'numeric' };
        return {
            issued: now.toLocaleDateString('en-US', options),
            expires: expiry.toLocaleDateString('en-US', options)
        };
    }

    // ── Generate 10 High-Fidelity printable templates with custom photo positions & match
    function renderSingleCard(s, school, side = 'front', config = studioConfig) {
        const isPortrait = config.orientation === 'portrait';
        const color = getThemeColor(); 
        const dates = getCardDates();
        
        const width = isPortrait ? '230px' : '348px';
        const height = isPortrait ? '348px' : '230px';
        
        const logoHtml = school.logo
            ? `<img src="${school.logo}" style="height:36px; width:auto; max-width:45px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15)); flex-shrink:0;">`
            : `<div style="width:36px; height:36px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; color:${color}; font-weight:900; font-size:18px; box-shadow:0 2px 5px rgba(0,0,0,0.15); flex-shrink:0;">${(school.name || 'N')[0]}</div>`;

        const makePhoto = (styleStr = '') => {
            if (!config.showPhoto) return '';
            return `<div style="width:75px; height:90px; border-radius:8px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:36px; background:#f8fafc; box-shadow:0 4px 12px rgba(0,0,0,0.1); ${styleStr}">
                ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;">` : s.emoji || '👤'}
            </div>`;
        };
        const makeSquarePhoto = (size = '75px', styleStr = '') => {
            if (!config.showPhoto) return '';
            return `<div style="width:${size}; height:${size}; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:36px; background:#f8fafc; box-shadow:0 4px 12px rgba(0,0,0,0.1); ${styleStr}">
                ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;">` : s.emoji || '👤'}
            </div>`;
        };
        const makeCirclePhoto = (size = '75px', styleStr = '') => {
            if (!config.showPhoto) return '';
            return `<div style="width:${size}; height:${size}; border-radius:50%; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:36px; background:#f8fafc; box-shadow:0 4px 12px rgba(0,0,0,0.1); ${styleStr}">
                ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;">` : s.emoji || '👤'}
            </div>`;
        };

        let trHtml = '';
        const addRow = (label, value) => {
            if (value) trHtml += `<tr><td style="font-weight:700; padding:1.5px 4px 1.5px 0; white-space:nowrap;">${label}</td><td style="padding:1.5px 0;">: ${value}</td></tr>`;
        };
        addRow('Reg No', s.id);
        addRow('Student ID', s.id);
        addRow('Student Name', s.name);
        if (config.showDob) addRow('D.O.B', s.dob);
        if (config.showBlood) addRow('Blood Grp', s.bloodGroup);
        addRow('Gender', s.gender);
        if (config.showPhone) addRow('Emrg. Call', s.phone);
        
        if (config.customFields && Array.isArray(config.customFields)) {
            config.customFields.forEach(f => {
                if (f.enabled) addRow(f.label, f.value);
            });
        }

        const templateId = config.templateId || 1;
        const flexDir = isPortrait ? 'column' : 'row';

        // ── Dynamic Signature Block Builder ─────────────────────────────────────
        const getSignaturesHtml = (textColor = '#fff', lineColor = 'rgba(255,255,255,0.5)') => {
            const sigs = (config.signatures || []).filter(s => s.title || s.name);
            if (sigs.length === 0) {
                return `<div style="text-align:center;">
                    <div style="font-family:'Brush Script MT',cursive; font-size:14px; line-height:1; color:${textColor};">Signed</div>
                    <div style="border-top:1px solid ${lineColor}; padding-top:2px; font-size:7px; font-weight:700; color:${textColor};">Principal</div>
                </div>`;
            }
            return sigs.map(sig => `
                <div style="text-align:center; margin:0 6px;">
                    <div style="height:20px; display:flex; align-items:flex-end; justify-content:center; margin-bottom:2px;">
                        ${sig.image ? `<img src="${sig.image}" style="max-height:20px; max-width:60px; object-fit:contain; filter: drop-shadow(0 0 1px rgba(255,255,255,0.5));">` : `<span style="color:${textColor};">___________</span>`}
                    </div>
                    <div style="border-top:1px solid ${lineColor}; padding-top:2px; font-size:6.5px; font-weight:700; color:${textColor}; white-space:nowrap;">${sig.title}</div>
                </div>
            `).join('');
        };

        const generateCSSBarcode = (text) => {
            const svgData = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Top Left Marker -->
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="#000" stroke-width="5"/>
                <rect x="12" y="12" width="11" height="11" fill="#000"/>
                <!-- Top Right Marker -->
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="#000" stroke-width="5"/>
                <rect x="77" y="12" width="11" height="11" fill="#000"/>
                <!-- Bottom Left Marker -->
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="#000" stroke-width="5"/>
                <rect x="12" y="77" width="11" height="11" fill="#000"/>
                <!-- Data blocks (pseudo-random) -->
                <rect x="35" y="5" width="10" height="10" fill="#000"/>
                <rect x="50" y="15" width="10" height="10" fill="#000"/>
                <rect x="5" y="35" width="20" height="10" fill="#000"/>
                <rect x="35" y="35" width="30" height="10" fill="#000"/>
                <rect x="75" y="45" width="20" height="10" fill="#000"/>
                <rect x="45" y="55" width="20" height="20" fill="#000"/>
                <rect x="35" y="75" width="10" height="20" fill="#000"/>
                <rect x="60" y="75" width="35" height="10" fill="#000"/>
                <rect x="80" y="85" width="15" height="10" fill="#000"/>
            </svg>`;
            return `<div style="width:36px; height:36px; background:#fff; padding:3px; margin-top:8px; border-radius:4px; box-sizing:border-box; margin-right:auto; box-shadow:0 1px 3px rgba(0,0,0,0.2);">
                        <img src="data:image/svg+xml;utf8,${encodeURIComponent(svgData)}" style="width:100%; height:100%; display:block;" />
                    </div>`;
        };

        const frontCard = (content, style, bgOverride = `${color}0D`, isDark = false) => {
            const safeSchoolName = (school.name || 'School').replace(/[<>&"']/g, '');
            const patternWidth = Math.max(50, safeSchoolName.length * 3.8);
            const patternHeight = 10;
            const svgWatermark = encodeURIComponent(`<svg width="${patternWidth}" height="${patternHeight}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="4.8px" font-weight="900" fill="${isDark ? '#ffffff' : color}" transform="rotate(-8, ${patternWidth / 2}, ${patternHeight / 2})" opacity="${isDark ? '0.025' : '0.06'}">${safeSchoolName}</text></svg>`);
            
            let backgroundStyle = `background-color:${bgOverride}; background-image:url('data:image/svg+xml,${svgWatermark}'); background-repeat:repeat;`;
            if (config.customBackground) {
                backgroundStyle = `background-image:url('${config.customBackground}'); background-size:cover; background-position:center;`;
            }

            return `<div class="cr80-card" style="width:${width}; height:${height}; border-radius:12px; overflow:hidden; font-family:system-ui,sans-serif; ${backgroundStyle} box-shadow:0 8px 24px rgba(0,0,0,0.08); display:flex; flex-direction:column; box-sizing:border-box; position:relative; ${style}">
                <div style="position:relative; z-index:2; display:flex; flex-direction:column; height:100%;">
                    ${content}
                </div>
            </div>`;
        };

        const getHeader = (bg, titleColor, subColor, extraStyles = '') => `
            <div style="background:${bg}; padding:8px; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; z-index:3; ${extraStyles}">
                <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
                    ${logoHtml}
                    <div style="font-size:12px; font-weight:900; color:${titleColor}; text-transform:uppercase; line-height:1.1;">${school.name}</div>
                </div>
                <div style="font-size:6.5px; font-weight:600; color:${subColor}; margin-top:4px; display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">
                    ${school.address ? `<span>📍 ${school.address}</span>` : ''}
                    ${school.phone ? `<span>📞 ${school.phone}</span>` : ''}
                    ${school.email ? `<span>✉️ ${school.email}</span>` : ''}
                </div>
            </div>
        `;

        const getHeaderLeft = (bg, titleColor, subColor, extraStyles = '') => `
            <div style="background:${bg}; padding:8px 12px; display:flex; align-items:center; gap:10px; position:relative; z-index:3; ${extraStyles}">
                ${logoHtml}
                <div style="flex:1;">
                    <div style="font-size:12px; font-weight:900; color:${titleColor}; text-transform:uppercase; line-height:1.1; margin-bottom:2px;">${school.name}</div>
                    <div style="font-size:6.5px; font-weight:600; color:${subColor}; display:flex; flex-wrap:wrap; gap:4px;">
                        ${school.address ? `<span>📍 ${school.address}</span>` : ''}
                        ${school.phone ? `<span>📞 ${school.phone}</span>` : ''}
                        ${school.email ? `<span>✉️ ${school.email}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        if (side === 'front') {
            switch(templateId) {
                case 1:
                    return frontCard(`
                        ${getHeaderLeft(color, '#fff', 'rgba(255,255,255,0.9)')}
                        <div style="flex:1; padding:12px; display:flex; flex-direction:${flexDir}; gap:12px; align-items:center;">
                            ${makeSquarePhoto('80px', `border:2px solid ${color};`)}
                            <div style="flex:1; width:100%;"><table style="width:100%; font-size:8.5px; line-height:1.3;">${trHtml}</table></div>
                        </div>
                        <div style="background:${color}; color:#fff; padding:6px 12px; display:flex; justify-content:flex-end; align-items:center; gap:12px;">
                            ${getSignaturesHtml('#fff', 'rgba(255,255,255,0.5)')}
                        </div>
                    `, `border:2px solid ${color}30;`);

                case 2:
                    return frontCard(`
                        ${getHeaderLeft(color, '#fff', 'rgba(255,255,255,0.9)', `
                            <div style="position:absolute; bottom:-10px; right:20px; width:40px; height:20px; background:${color}; transform:skewX(-30deg); z-index:1;"></div>
                            <div style="position:absolute; bottom:-20px; right:40px; width:30px; height:20px; background:${color}; transform:skewX(30deg); opacity:0.8; z-index:1;"></div>
                        `)}
                        <div style="flex:1; padding:16px 12px; display:flex; flex-direction:${flexDir}; gap:12px; align-items:center;">
                            ${makeSquarePhoto('80px', `border:2px solid ${color};`)}
                            <div style="flex:1; width:100%; position:relative; z-index:2;"><table style="width:100%; font-size:8.5px;">${trHtml}</table></div>
                        </div>
                        <div style="background:${color}; color:#fff; padding:6px 12px; display:flex; justify-content:flex-end; align-items:center; gap:12px; position:relative;">
                            <div style="position:absolute; top:-10px; left:10px; width:30px; height:20px; background:${color}; transform:skewX(30deg); opacity:0.9;"></div>
                            <div style="display:flex; gap:12px; align-items:center; z-index:2;">${getSignaturesHtml('#fff', 'rgba(255,255,255,0.5)')}</div>
                        </div>
                    `, ``);

                case 3:
                    return frontCard(`
                        <div style="position:relative; width:100%; height:${isPortrait ? '135px' : '100px'}; z-index:3;">
                            <div style="position:absolute; top:0; left:0; right:0; height:100%; background:${color}; clip-path:polygon(0 0, 100% 0, 100% 40%, 50% 100%, 0 40%); display:flex; flex-direction:column; align-items:center;">
                                ${getHeader('transparent', '#fff', 'rgba(255,255,255,0.9)', 'width:100%;')}
                            </div>
                            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); z-index:4;">
                                ${makeCirclePhoto(isPortrait ? '70px' : '60px', `border:3px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.15);`)}
                            </div>
                        </div>
                        <div style="flex:1; padding:10px 16px; display:flex; justify-content:center;">
                            <table style="width:100%; max-width:200px; font-size:8.5px; margin:0 auto; position:relative; z-index:2;">${trHtml}</table>
                        </div>
                        <div style="background:${color}; color:#fff; padding:4px; text-align:center; font-size:7px; font-weight:700; text-transform:uppercase;">Student Identity Card</div>
                    `, ``);

                case 4:
                    return frontCard(`
                        ${getHeader(color, '#fff', 'rgba(255,255,255,0.9)')}
                        <div style="position:relative; width:100%; height:80px; display:flex; justify-content:center; align-items:center; z-index:3;">
                            <div style="position:absolute; top:0; left:0; right:0; height:40px; background:${color}; clip-path:polygon(0 0, 100% 0, 50% 100%); z-index:1;"></div>
                            <div style="position:absolute; top:10px; left:0; right:0; height:40px; background:#1e293b; clip-path:polygon(0 0, 100% 0, 50% 100%); z-index:0;"></div>
                            <div style="z-index:2; margin-top:20px;">${makeSquarePhoto('65px', `border:2px solid #1e293b;`)}</div>
                        </div>
                        <div style="flex:1; padding:16px; display:flex; justify-content:center;">
                            <table style="width:100%; max-width:180px; font-size:8.5px; position:relative; z-index:2;">${trHtml}</table>
                        </div>
                    `, `border:1px solid #e2e8f0;`);

                case 5:
                    return frontCard(`
                        <div style="position:absolute; top:0; left:0; width:40%; height:20px; background:${color}; z-index:1;"></div>
                        <div style="position:absolute; top:20px; left:0; width:20px; height:40px; background:${color}; z-index:1;"></div>
                        <div style="position:absolute; bottom:0; right:0; width:40%; height:20px; background:${color}; z-index:1;"></div>
                        <div style="position:absolute; bottom:20px; right:0; width:20px; height:40px; background:${color}; z-index:1;"></div>
                        
                        ${getHeader('transparent', '#1e293b', '#64748b', 'padding-top:16px; padding-left:36px; padding-right:24px; text-align:right; align-items:flex-end;')}
                        <div style="flex:1; padding:10px 24px; display:flex; flex-direction:${flexDir}; gap:20px; align-items:center; justify-content:center; position:relative; z-index:2;">
                            ${makeSquarePhoto('80px', `border:4px solid ${color};`)}
                            <div style="flex:1; width:100%;"><table style="width:100%; font-size:8.5px;">${trHtml}</table></div>
                        </div>
                    `, ``);

                case 6:
                    return frontCard(`
                        <div style="display:flex; flex-direction:${flexDir}; height:100%;">
                            <div style="${isPortrait ? 'height:auto; min-height:40%;' : 'width:45%;'} background:${color}; color:#fff; display:flex; flex-direction:column; justify-content:center; padding:12px; z-index:3;">
                                ${getHeader('transparent', '#fff', 'rgba(255,255,255,0.9)', 'padding:0;')}
                            </div>
                            <div style="flex:1; padding:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:2;">
                                <div style="position:absolute; ${isPortrait ? 'top:-40px' : 'left:-40px; top:50%; transform:translateY(-50%)'}; z-index:4;">
                                    ${makeCirclePhoto('80px', `border:4px solid #fff; box-shadow:0 4px 12px rgba(0,0,0,0.15);`)}
                                </div>
                                <div style="margin-top:${isPortrait ? '45px' : '0'}; margin-left:${isPortrait ? '0' : '50px'}; width:100%;">
                                    <table style="width:100%; max-width:200px; margin:0 auto; font-size:8.5px;">${trHtml}</table>
                                </div>
                            </div>
                        </div>
                    `, ``);

                case 7:
                    return frontCard(`
                        <div style="position:relative; z-index:3;">
                            ${getHeader(`linear-gradient(135deg, ${color}, ${color}dd)`, '#fff', 'rgba(255,255,255,0.9)', 'padding-bottom:20px;')}
                            <svg style="position:absolute; bottom:-1px; left:0; width:100%; height:30px;" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="#0f172a" fill-opacity="1" d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,133.3C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                        </div>
                        <div style="flex:1; display:flex; flex-direction:${flexDir}; gap:12px; padding:12px; align-items:center; margin-top:-25px; z-index:4;">
                            ${makeCirclePhoto('80px', `border:3px solid #fff; box-shadow:0 6px 16px rgba(0,0,0,0.1);`)}
                            <div style="flex:1; width:100%;"><table style="width:100%; font-size:8.5px;">${trHtml.replace(/#334155/g, '#94a3b8').replace(/#0f172a/g, '#f8fafc')}</table></div>
                        </div>
                    `, `background:#0f172a;`, `#0f172a`, true);

                case 8:
                    return frontCard(`
                        ${getHeaderLeft('transparent', '#0f172a', '#475569', `border-bottom:2px solid ${color};`)}
                        <div style="flex:1; display:flex; flex-direction:${flexDir};">
                            <div style="${isPortrait ? 'width:100%; padding:12px; display:flex; justify-content:center; border-bottom:1px solid #e2e8f0;' : 'width:40%; padding:12px; display:flex; justify-content:center; border-right:1px solid #e2e8f0;'} position:relative; z-index:2;">
                                ${makeSquarePhoto('85px', `border-radius:12px;`)}
                            </div>
                            <div style="flex:1; padding:12px; position:relative; z-index:2;"><table style="width:100%; font-size:8.5px;">${trHtml}</table></div>
                        </div>
                    `, `border:1px solid #cbd5e1;`);

                case 9:
                    return frontCard(`
                        <div style="display:flex; height:100%;">
                            <div style="width:8px; background:${color}; height:100%; position:relative; z-index:3;"></div>
                            <div style="flex:1; display:flex; flex-direction:column;">
                                ${getHeaderLeft('transparent', '#0f172a', '#475569', 'border-bottom:1px solid #f1f5f9;')}
                                <div style="flex:1; padding:12px; display:flex; flex-direction:${flexDir}; gap:12px; align-items:center; position:relative; z-index:2;">
                                    ${makePhoto(`border-radius:6px;`)}
                                    <div style="flex:1; width:100%;"><table style="width:100%; font-size:8.5px;">${trHtml}</table></div>
                                </div>
                            </div>
                        </div>
                    `, ``);

                case 10:
                    return frontCard(`
                        ${getHeaderLeft('#0f172a', '#fbbf24', '#cbd5e1', 'border-bottom:2px solid #fbbf24;')}
                        <div style="flex:1; padding:12px; display:flex; flex-direction:${flexDir}; gap:12px; align-items:center; position:relative; z-index:2;">
                            ${makePhoto(`border:2px solid #fbbf24; border-radius:4px; box-shadow:0 4px 10px rgba(0,0,0,0.1);`)}
                            <div style="flex:1; width:100%;"><table style="width:100%; font-size:8.5px;">${trHtml.replace(/#334155/g, '#94a3b8').replace(/#0f172a/g, '#f8fafc')}</table></div>
                        </div>
                    `, `background:linear-gradient(135deg, #1e293b, #0f172a); border:1px solid #cbd5e1;`, `#0f172a`, true);
            }
        } else {
            const barcodeHtml = config.showBarcode ? generateCSSBarcode(s.id) : '';
            const rulesBlock = `<div style="font-size:8px; color:#475569; line-height:1.5; text-align:justify; margin-top:4px;">${config.rules}</div>${barcodeHtml}`;
            const datesBlock = `<div style="display:flex; justify-content:space-between; font-size:7.5px; font-weight:700; color:#334155; margin-top:10px;">
                <span>Joined Date : ${dates.issued}</span>
                <span>Expire Date : ${dates.expires}</span>
            </div>`;

            switch(templateId) {
                case 1:
                    return frontCard(`
                        <div style="background:${color}; color:#fff; padding:10px 12px; font-size:11px; font-weight:900; text-transform:uppercase;">Terms and Conditions</div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            ${datesBlock}
                        </div>
                        <div style="background:${color}; color:#fff; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-size:7px; line-height:1.4;">
                                <div>Phone : ${school.phone || '---'}</div>
                                <div>Address : ${school.address || '---'}</div>
                            </div>
                            ${logoHtml}
                        </div>
                    `, `border:2px solid ${color}30;`);

                case 2:
                    return frontCard(`
                        <div style="background:${color}; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; color:#fff; position:relative; z-index:2;">
                            <div style="font-size:11px; font-weight:900; text-transform:uppercase;">Terms and Conditions</div>
                            <div style="position:absolute; bottom:-10px; right:40px; width:40px; height:20px; background:${color}; transform:skewX(-30deg); z-index:1;"></div>
                        </div>
                        <div style="flex:1; padding:16px 12px; display:flex; flex-direction:column; justify-content:center;">
                            ${rulesBlock}
                            ${datesBlock}
                        </div>
                        <div style="background:${color}; color:#fff; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; position:relative;">
                            <div style="position:absolute; top:-10px; left:20px; width:30px; height:20px; background:${color}; transform:skewX(30deg); opacity:0.9;"></div>
                            <div style="font-size:7px; z-index:2;">
                                <div>${school.phone || ''}</div>
                                <div>${school.address || ''}</div>
                            </div>
                            <div style="z-index:2; text-align:center;">
                                <div style="font-family:'Brush Script MT',cursive; font-size:14px; line-height:1;">Signed</div>
                                <div style="font-size:7px; font-weight:700;">Principal</div>
                            </div>
                        </div>
                    `, ``);

                case 3:
                    return frontCard(`
                        <div style="background:${color}; color:#fff; padding:16px; text-align:center;">
                            <div style="font-size:11px; font-weight:900; text-transform:uppercase;">Terms and Conditions</div>
                        </div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            ${datesBlock}
                        </div>
                        <div style="background:${color}; padding:8px; display:flex; justify-content:center;">
                            ${logoHtml}
                        </div>
                    `, ``);

                case 4:
                    return frontCard(`
                        <div style="background:${color}; padding:10px; text-align:center; color:#fff;">
                            <div style="font-size:12px; font-weight:900; text-transform:uppercase;">Terms and Conditions</div>
                        </div>
                        <div style="position:relative; width:100%; height:30px;">
                            <div style="position:absolute; top:0; left:0; right:0; height:30px; background:${color}; clip-path:polygon(0 0, 100% 0, 50% 100%);"></div>
                        </div>
                        <div style="flex:1; padding:12px 16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            ${datesBlock}
                        </div>
                    `, `border:1px solid #e2e8f0;`);

                case 5:
                    return frontCard(`
                        <div style="position:absolute; top:0; left:0; width:40%; height:20px; background:${color};"></div>
                        <div style="position:absolute; top:20px; left:0; width:20px; height:40px; background:${color};"></div>
                        <div style="position:absolute; bottom:0; right:0; width:40%; height:20px; background:${color};"></div>
                        <div style="position:absolute; bottom:20px; right:0; width:20px; height:40px; background:${color};"></div>
                        <div style="padding:16px 24px; display:flex; flex-direction:column; height:100%; justify-content:space-between; position:relative; z-index:2;">
                            <div>
                                <div style="background:${color}; color:#fff; display:inline-block; padding:4px 8px; font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Terms and Conditions</div>
                                ${rulesBlock}
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                                <div style="font-size:7px; color:#475569; line-height:1.4;">${datesBlock}</div>
                                <div style="text-align:center;">
                                    <div style="font-family:'Brush Script MT',cursive; font-size:14px; line-height:1;">Signed</div>
                                    <div style="border-top:1px solid #cbd5e1; padding-top:2px; font-size:7px; font-weight:700;">Principal</div>
                                </div>
                            </div>
                        </div>
                    `, ``);

                case 6:
                    return frontCard(`
                        <div style="background:${color}; color:#fff; padding:12px; text-align:center; font-size:11px; font-weight:900; text-transform:uppercase;">Terms & Conditions</div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">${datesBlock}</div>
                        </div>
                    `, ``);

                case 7:
                    return frontCard(`
                        <div style="height:60px; background:linear-gradient(135deg, ${color}, ${color}dd); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:900; text-transform:uppercase;">
                            Terms & Conditions
                        </div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            <div style="border-top:2px solid ${color}40; padding-top:8px;">${datesBlock}</div>
                        </div>
                    `, ``);

                case 8:
                    return frontCard(`
                        <div style="padding:12px; border-bottom:2px solid ${color};">
                            <div style="font-size:11px; font-weight:900; color:#0f172a; text-transform:uppercase;">Terms & Conditions</div>
                        </div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                            ${rulesBlock}
                            ${datesBlock}
                        </div>
                    `, `border:1px solid #cbd5e1; background:#fafaf9;`);

                case 9:
                    return frontCard(`
                        <div style="display:flex; height:100%;">
                            <div style="width:8px; background:${color}; height:100%;"></div>
                            <div style="flex:1; display:flex; flex-direction:column;">
                                <div style="padding:12px; border-bottom:1px solid #f1f5f9; font-size:11px; font-weight:900; color:#0f172a; text-transform:uppercase;">Terms & Conditions</div>
                                <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                                    ${rulesBlock}
                                    ${datesBlock}
                                </div>
                            </div>
                        </div>
                    `, ``);

                case 10:
                    return frontCard(`
                        <div style="background:#0f172a; border-bottom:2px solid #fbbf24; padding:12px; text-align:center; color:#fbbf24; font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">
                            Terms & Conditions
                        </div>
                        <div style="flex:1; padding:16px; display:flex; flex-direction:column; justify-content:space-between; background:#f8fafc;">
                            ${rulesBlock}
                            <div style="background:#0f172a; color:#fbbf24; padding:8px; border-radius:4px; font-size:7px; display:flex; justify-content:space-between;">
                                <span>ISS: ${dates.issued}</span>
                                <span>EXP: ${dates.expires}</span>
                            </div>
                        </div>
                    `, `border:1px solid #cbd5e1;`);
                
                default:
                    return frontCard(`<div style="padding:16px;">${rulesBlock}</div>`, ``);
            }
        }
    }

    let allStudents = loadStudents();
    let filtered = [...allStudents];
    let selected = new Set();
    
    // Binding flow state
    let nfcBindingStudentId = null;
    let nfcScanBuffer = "";
    let nfcScanTimeout = null;

    // ── Table Builder ──────────────────────────────────────────────────────
    function buildRow(s) {
        const isChecked = selected.has(s.id);
        const cardBadge = s.nfc_uid 
            ? `<span class="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold font-mono"><i class="fas fa-microchip"></i> ${s.nfc_uid}</span>`
            : `<span class="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-medium">No Card Link</span>`;

        return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${isChecked ? 'bg-primary-50 dark:bg-primary-900/20' : ''}">
            <td class="px-4 py-3.5">
                <input type="checkbox" onchange="window.idCardApp.toggle('${s.id}', this.checked)" ${isChecked ? 'checked' : ''} class="rounded w-4 h-4 cursor-pointer text-primary-600 focus:ring-primary-500">
            </td>
            <td class="px-4 py-3.5">
                <div class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                    ${s.photo ? `<img src="${s.photo}" class="w-full h-full object-cover rounded-full">` : s.emoji || '👤'}
                </div>
            </td>
            <td class="px-4 py-3.5 font-mono text-xs text-primary-700 dark:text-primary-400 font-semibold">${s.id}</td>
            <td class="px-4 py-3.5 font-medium text-gray-900 dark:text-white">${s.name}</td>
            <td class="px-4 py-3.5"><span class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded font-semibold">${s.className}</span></td>
            <td class="px-4 py-3.5">${cardBadge}</td>
            <td class="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-400">${s.phone || '—'}</td>
            <td class="px-4 py-3.5"><span class="text-xs font-bold text-red-600 dark:text-red-400">${s.bloodGroup || '—'}</span></td>
            <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <button onclick="window.idCardApp.openNfcModal('${s.id}')" class="text-xs px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded hover:bg-primary-100 mr-1 transition-all" title="Link/Bind Smart Card">
                    <i class="fas fa-satellite-dish"></i> Bind Card
                </button>
                <button onclick="window.idCardApp.openModal('${s.id}')" class="text-xs px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 rounded hover:bg-yellow-100 mr-1 transition-all" title="Edit Student">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button onclick="window.idCardApp.preview('${s.id}')" class="text-xs px-2.5 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 mr-1 transition-all" title="Card Double-Sided Preview">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`;
    }

    function renderTable() {
        const tbody = document.getElementById('idc-tbody');
        const countEl = document.getElementById('idc-count');
        const selEl = document.getElementById('idc-selected');
        
        if (countEl) countEl.textContent = filtered.length;
        if (selEl) selEl.textContent = selected.size;
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-16 text-center text-gray-400"><i class="fas fa-id-card text-4xl mb-3 block opacity-25"></i>No matching student records found.</td></tr>';
            return;
        }
        tbody.innerHTML = filtered.map(s => buildRow(s)).join('');
        const hdr = document.getElementById('idc-check-all');
        if (hdr) hdr.checked = filtered.length > 0 && filtered.every(s => selected.has(s.id));
    }

    // ── Design Studio Live Render Preview ───────────────────────────────────
    function renderStudioPreview() {
        const frontContainer = document.getElementById('studio-preview-card-front');
        const backContainer = document.getElementById('studio-preview-card-back');
        if (!frontContainer || !backContainer) return;

        // Visual preview dummy student
        const dummyPreviewStudent = {
            id: 'STU0099',
            name: 'Emeka Okafor',
            className: 'JSS1A',
            dob: '2010-04-12',
            gender: 'Male',
            bloodGroup: 'O+',
            emoji: '👦',
            session: '2024/2025',
            phone: '08032128912',
            nfc_uid: 'NFC88123'
        };

        const school = getSchoolInfo();
        frontContainer.innerHTML = renderSingleCard(dummyPreviewStudent, school, 'front', studioConfig);
        backContainer.innerHTML = renderSingleCard(dummyPreviewStudent, school, 'back', studioConfig);
    }

    // ── Render custom field lists dynamically inside Sidebar UI ──────────────
    function drawCustomFieldsList() {
        const container = document.getElementById('studio-custom-fields-list');
        if (!container) return;

        if (!studioConfig.customFields || studioConfig.customFields.length === 0) {
            container.innerHTML = `<span class="block text-xs text-gray-400 italic">No custom fields created yet.</span>`;
            return;
        }

        container.innerHTML = studioConfig.customFields.map(f => {
            return `
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/60 border dark:border-gray-700 p-2 rounded-lg text-xs">
                <label class="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    <input type="checkbox" onchange="window.idCardApp.toggleCustomField('${f.id}', this.checked)" ${f.enabled?'checked':''} class="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5">
                    <span class="font-bold text-gray-900 dark:text-white">${f.label}:</span>
                    <span class="text-gray-500 truncate max-w-[100px]">${f.value}</span>
                </label>
                <button onclick="window.idCardApp.deleteCustomField('${f.id}')" class="text-red-500 hover:text-red-700 px-1"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        }).join('');
    }

    // ── Dual Sided Batch Printing Window ──────────────────────────────────
    function printSelectedCards(students) {
        const school = getSchoolInfo();
        const cardsHtml = students.map(s => `
            <div class="print-card-pair" style="display:inline-flex; gap:10px; margin-bottom:12mm; page-break-inside:avoid;">
                ${renderSingleCard(s, school, 'front', studioConfig)}
                ${renderSingleCard(s, school, 'back', studioConfig)}
            </div>
        `).join('');

        const win = window.open('', '_blank', 'width=1000,height=800');
        win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print ID Cards — ${school.name}</title>
            <style>
                body { background: #f3f4f6; margin: 0; padding: 15mm; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; }
                .cr80-card { box-shadow: none !important; }
                @media print {
                    body { background: #fff; padding: 0; }
                    .print-card-pair { page-break-inside: avoid; }
                    @page { margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <div style="max-width: 800px; width:100%; text-align:left; margin-bottom: 20px; font-size: 13px; color: #4b5563;" class="no-print">
                <h3 style="margin:0 0 5px 0; color:#111;">Batch Print Mode</h3>
                <p style="margin:0;">Layout formatted directly in **CR80 standard metrics** (Landscape/Portrait). Ready to print to standard card cutters or card trays. Press **Ctrl + P** if the print menu doesn't open automatically.</p>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center;">
                ${cardsHtml}
            </div>
        </body>
        </html>`);
        win.document.close();
        setTimeout(() => win.print(), 800);
    }

    function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
    function getField(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

    window.idCardApp = {
        switchTab(tabId) {
            const dirTab = document.getElementById('idc-tab-directory');
            const studioTab = document.getElementById('idc-tab-studio');
            const dirBtn = document.getElementById('tab-directory-btn');
            const studioBtn = document.getElementById('tab-studio-btn');

            if (tabId === 'directory') {
                dirTab.classList.remove('hidden');
                dirTab.classList.add('block');
                studioTab.classList.remove('block');
                studioTab.classList.add('hidden');

                dirBtn.className = "inline-block p-4 border-b-2 border-primary-600 text-primary-600 font-semibold";
                studioBtn.className = "inline-block p-4 border-b-2 border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:text-gray-300 transition-all";
            } else {
                dirTab.classList.remove('block');
                dirTab.classList.add('hidden');
                studioTab.classList.remove('hidden');
                studioTab.classList.add('block');

                studioBtn.className = "inline-block p-4 border-b-2 border-primary-600 text-primary-600 font-semibold";
                dirBtn.className = "inline-block p-4 border-b-2 border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:text-gray-300 transition-all";

                // Initialize configurations UI in studio
                document.getElementById('studio-back-rules').value = studioConfig.rules;
                document.getElementById('studio-show-photo').checked = studioConfig.showPhoto;
                document.getElementById('studio-show-dob').checked = studioConfig.showDob;
                document.getElementById('studio-show-blood').checked = studioConfig.showBlood;
                document.getElementById('studio-show-phone').checked = studioConfig.showPhone;
                
                const magBtn = document.getElementById('studio-show-magstripe');
                if (magBtn) magBtn.checked = studioConfig.showMagStripe;
                const bcBtn = document.getElementById('studio-show-barcode');
                if (bcBtn) bcBtn.checked = studioConfig.showBarcode;

                const bgClearBtn = document.getElementById('studio-clear-bg-btn');
                if (bgClearBtn) {
                    bgClearBtn.style.display = studioConfig.customBackground ? 'inline-block' : 'none';
                }
                
                const addressChk = document.getElementById('studio-show-address');
                const schPhoneChk = document.getElementById('studio-show-schphone');


                const templateSelect = document.getElementById('studio-template-id');
                if (templateSelect) {
                    templateSelect.value = studioConfig.templateId || 1;
                }

                this.updateStudioOrientationButtons();
                drawCustomFieldsList();
                this.drawSignaturesList();
                this.initColorUI();
                renderStudioPreview();
            }
        },

        changeStudioConfig(key, val) {
            studioConfig[key] = val;
            this.updateStudioOrientationButtons();
            renderStudioPreview();
        },

        updateStudioOrientationButtons() {
            const portBtn = document.getElementById('studio-btn-portrait');
            const landBtn = document.getElementById('studio-btn-landscape');
            if (!portBtn || !landBtn) return;

            if (studioConfig.orientation === 'portrait') {
                portBtn.className = "px-4 py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300";
                landBtn.className = "px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 transition-all hover:bg-gray-50";
            } else {
                landBtn.className = "px-4 py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300";
                portBtn.className = "px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 transition-all hover:bg-gray-50";
            }
        },

        toggleStudioField(key) {
            studioConfig[key] = !studioConfig[key];
            renderStudioPreview();
        },

        updateStudioBackRules(text) {
            studioConfig.rules = text;
            renderStudioPreview();
        },

        // ── Custom Dynamic Fields Handler ───────────────────────────────────────
        addCustomField() {
            const label = getField('studio-new-field-label');
            const value = getField('studio-new-field-value');
            if (!label || !value) { alert('Please enter both a Field Name and Value.'); return; }

            const newField = {
                id: `cf_${Date.now()}`,
                label,
                value,
                enabled: true
            };

            if (!studioConfig.customFields) studioConfig.customFields = [];
            studioConfig.customFields.push(newField);
            
            // Clear creator forms
            setField('studio-new-field-label', '');
            setField('studio-new-field-value', '');

            drawCustomFieldsList();
            renderStudioPreview();
        },

        toggleCustomField(fieldId, isChecked) {
            const idx = studioConfig.customFields.findIndex(f => f.id === fieldId);
            if (idx !== -1) {
                studioConfig.customFields[idx].enabled = isChecked;
                renderStudioPreview();
            }
        },

        deleteCustomField(fieldId) {
            studioConfig.customFields = studioConfig.customFields.filter(f => f.id !== fieldId);
            drawCustomFieldsList();
            renderStudioPreview();
        },

        editingSignatureId: null,

        handleBgUpload(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    studioConfig.customBackground = e.target.result;
                    const bgClearBtn = document.getElementById('studio-clear-bg-btn');
                    if (bgClearBtn) bgClearBtn.style.display = 'inline-block';
                    renderStudioPreview();
                };
                reader.readAsDataURL(input.files[0]);
            }
        },

        clearCustomBg() {
            studioConfig.customBackground = null;
            const fileInput = document.getElementById('studio-bg-upload');
            if (fileInput) fileInput.value = '';
            const bgClearBtn = document.getElementById('studio-clear-bg-btn');
            if (bgClearBtn) bgClearBtn.style.display = 'none';
            renderStudioPreview();
        },

        generateBatchPrintLayout() {
            const classSelect = document.getElementById('idc-class-select');
            let className = '';
            if (classSelect && classSelect.value) {
                className = classSelect.value;
            } else {
                // Default to first class if not on directory tab
                className = CLASSES[0];
            }
            const students = JSON.parse(localStorage.getItem('sms_students') || '[]').filter(s => s.className === className);
            
            if (students.length === 0) {
                alert('No students found in ' + className + '.');
                return;
            }
            
            // Limit to a reasonable batch size for browser printing to avoid hanging
            const batch = students.slice(0, 20); 

            // Call the internal printSelectedCards function
            printSelectedCards(batch);
        },

        handleSignatureUpload(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const hiddenInput = document.getElementById('studio-sig-image-base64');
                    if (hiddenInput) hiddenInput.value = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        },

        addSignature() {
            const imageBase64 = getField('studio-sig-image-base64');
            const title = getField('studio-sig-title');
            if (!title) { alert('Please enter a title for the signatory (e.g. School Principal).'); return; }

            if (!studioConfig.signatures) studioConfig.signatures = [];
            
            if (this.editingSignatureId) {
                const sig = studioConfig.signatures.find(s => s.id === this.editingSignatureId);
                if (sig) {
                    sig.image = imageBase64 || sig.image;
                    sig.title = title;
                }
                this.editingSignatureId = null;
                const btn = document.getElementById('studio-sig-submit-btn');
                if (btn) btn.innerHTML = 'Add to Card';
            } else {
                studioConfig.signatures.push({
                    id: `sig_${Date.now()}`,
                    image: imageBase64,
                    title
                });
            }

            setField('studio-sig-image-base64', '');
            const fileInput = document.getElementById('studio-sig-image');
            if (fileInput) fileInput.value = '';
            setField('studio-sig-title', '');
            this.drawSignaturesList();
            renderStudioPreview();
        },

        editSignature(sigId) {
            const sig = studioConfig.signatures.find(s => s.id === sigId);
            if (!sig) return;
            
            setField('studio-sig-image-base64', sig.image || '');
            setField('studio-sig-title', sig.title || '');
            // We cannot set file input value programmatically for security reasons, so it stays empty
            this.editingSignatureId = sigId;
            
            const btn = document.getElementById('studio-sig-submit-btn');
            if (btn) btn.innerHTML = 'Update Signature';
        },

        deleteSignature(sigId) {
            studioConfig.signatures = studioConfig.signatures.filter(s => s.id !== sigId);
            this.drawSignaturesList();
            renderStudioPreview();
        },

        drawSignaturesList() {
            const container = document.getElementById('studio-signatures-list');
            if (!container) return;
            const sigs = studioConfig.signatures || [];
            if (sigs.length === 0) {
                container.innerHTML = `<span class="block text-xs text-gray-400 italic">No signatories added. Cards will show default "Principal" line.</span>`;
                return;
            }
            container.innerHTML = sigs.map(sig => `
                <div class="flex items-center justify-between bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 p-2.5 rounded-lg text-xs">
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">${sig.image ? `<img src="${sig.image}" class="h-6 object-contain rounded bg-white/50 p-0.5">` : '<em class="font-normal text-gray-400">No Image</em>'}</div>
                        <div class="text-primary-600 dark:text-primary-400 font-semibold">${sig.title}</div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="window.idCardApp.editSignature('${sig.id}')" title="Edit" class="text-blue-500 hover:text-blue-700 p-1"><i class="fas fa-edit"></i></button>
                        <button onclick="window.idCardApp.deleteSignature('${sig.id}')" title="Delete" class="text-red-500 hover:text-red-700 p-1 ml-1"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `).join('');
        },

        // ── Color Customizer ───────────────────────────────────────────────────
        setColorMode(mode) {
            studioConfig.colorMode = mode;
            const customInput = document.getElementById('studio-custom-color');
            if (mode === 'custom' && customInput) {
                studioConfig.cardCustomColor = customInput.value;
                const hexInput = document.getElementById('studio-custom-hex');
                if (hexInput) hexInput.value = customInput.value;
            }
            renderStudioPreview();
        },

        applyCustomColor(hexColor) {
            studioConfig.colorMode = 'custom';
            studioConfig.cardCustomColor = hexColor;
            const radioCustom = document.getElementById('card-color-custom');
            if (radioCustom) radioCustom.checked = true;
            const hexInput = document.getElementById('studio-custom-hex');
            if (hexInput && hexInput.value !== hexColor) hexInput.value = hexColor;
            renderStudioPreview();
        },

        applyHexInput(hexColor) {
            // Check if hex is valid 3 or 6 digit color
            if (/^#[0-9A-F]{6}$/i.test(hexColor) || /^#[0-9A-F]{3}$/i.test(hexColor)) {
                studioConfig.colorMode = 'custom';
                studioConfig.cardCustomColor = hexColor;
                const radioCustom = document.getElementById('card-color-custom');
                if (radioCustom) radioCustom.checked = true;
                const colorInput = document.getElementById('studio-custom-color');
                if (colorInput) colorInput.value = hexColor;
                renderStudioPreview();
            }
        },

        initColorUI() {
            const globalSwatch = document.getElementById('global-color-swatch');
            // Show what the global theme color is currently
            const activeTheme = localStorage.getItem('selectedTheme') || 'blue';
            const themeColors = {
                'blue':'#0284c7','green':'#059669','purple':'#9333ea','red':'#e11d48',
                'teal':'#0d9488','gold':'#d97706','navy-blue':'#202B5D','forest':'#043927',
                'ruby':'#C32644','slate':'#475569'
            };
            const globalColor = activeTheme === 'custom'
                ? (localStorage.getItem('customThemeColor') || '#3b82f6')
                : (themeColors[activeTheme] || '#0284c7');
            if (globalSwatch) globalSwatch.style.background = globalColor;

            const radioGlobal = document.getElementById('card-color-global');
            const radioCustom = document.getElementById('card-color-custom');
            const colorInput = document.getElementById('studio-custom-color');
            const hexInput = document.getElementById('studio-custom-hex');

            if (studioConfig.colorMode === 'custom') {
                if (radioCustom) radioCustom.checked = true;
                const activeColor = studioConfig.cardCustomColor || '#0284c7';
                if (colorInput) colorInput.value = activeColor;
                if (hexInput) hexInput.value = activeColor;
            } else {
                if (radioGlobal) radioGlobal.checked = true;
                if (hexInput) hexInput.value = globalColor;
            }
        },

        saveTemplateConfig() {
            localStorage.setItem('sms_id_card_config', JSON.stringify(studioConfig));
            alert('Smart Card template config saved successfully!');
        },

        // ── Card Binding NFC Modal ──────────────────────────────────────────
        openNfcModal(studentId) {
            nfcBindingStudentId = studentId;
            nfcScanBuffer = "";

            const student = allStudents.find(s => s.id === studentId);
            document.getElementById('nfc-modal-title').textContent = `Linking: ${student.name}`;
            document.getElementById('nfc-modal-desc').textContent = `Ready to register card. Tap an NFC card against the scanner.`;
            
            const pulse = document.getElementById('nfc-pulse-indicator');
            pulse.className = "w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center relative";
            pulse.innerHTML = `<div class="absolute inset-0 rounded-full bg-primary-400/20 animate-ping"></div><i class="fas fa-wave-square text-primary-600 dark:text-primary-400 text-4xl"></i>`;

            document.getElementById('idc-nfc-modal').classList.remove('hidden');

            const inp = document.getElementById('nfc-wedge-input');
            if (inp) {
                inp.value = "";
                setTimeout(() => inp.focus(), 100);
            }
        },

        closeNfcModal() {
            document.getElementById('idc-nfc-modal').classList.add('hidden');
            nfcBindingStudentId = null;
            nfcScanBuffer = "";
        },

        simulateScan() {
            if (!nfcBindingStudentId) return;
            const randomUid = `NFC${Math.floor(Math.random() * 89999 + 10000)}`;
            this.processCardBinding(randomUid);
        },

        processCardBinding(cardUid) {
            const studentIdx = allStudents.findIndex(s => s.id === nfcBindingStudentId);
            if (studentIdx === -1) return;

            const dup = allStudents.find(s => s.nfc_uid === cardUid && s.id !== nfcBindingStudentId);
            if (dup) {
                alert(`Error: This card UID (${cardUid}) is already bound to another student: ${dup.name} (${dup.id}).`);
                return;
            }

            allStudents[studentIdx].nfc_uid = cardUid;
            saveStudents();

            const pulse = document.getElementById('nfc-pulse-indicator');
            pulse.className = "w-24 h-24 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center relative";
            pulse.innerHTML = `<i class="fas fa-check text-green-600 dark:text-green-400 text-4xl"></i>`;

            document.getElementById('nfc-modal-title').textContent = "Binding Success!";
            document.getElementById('nfc-modal-desc').textContent = `Card UID (${cardUid}) linked to student profile.`;

            filtered = [...allStudents];
            renderTable();

            setTimeout(() => {
                this.closeNfcModal();
            }, 1200);
        },

        // ── Standard Directory Controls ───────────────────────────────────────
        filter() {
            const cls = document.getElementById('idc-filter-class')?.value || '';
            const q = (document.getElementById('idc-search')?.value || '').toLowerCase();
            filtered = allStudents.filter(s =>
                (!cls || s.className === cls) &&
                (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.nfc_uid || '').toLowerCase().includes(q))
            );
            renderTable();
        },

        toggle(id, checked) {
            if (checked) selected.add(id); else selected.delete(id);
            const selEl = document.getElementById('idc-selected');
            if (selEl) selEl.textContent = selected.size;
            const hdr = document.getElementById('idc-check-all');
            if (hdr) hdr.checked = filtered.length > 0 && filtered.every(s => selected.has(s.id));
        },

        toggleAll(checked) {
            if (checked) filtered.forEach(s => selected.add(s.id));
            else filtered.forEach(s => selected.delete(s.id));
            renderTable();
        },

        selectAll() { filtered.forEach(s => selected.add(s.id)); renderTable(); },
        clearAll()  { selected.clear(); renderTable(); },

        preview(id) {
            const s = allStudents.find(x => x.id === id);
            if (!s) return;
            _previewStudent = s;

            const school = getSchoolInfo();
            const container = document.getElementById('idc-preview-card');
            container.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="text-xs font-semibold text-gray-500 mb-2">Card Front</span>
                    ${renderSingleCard(s, school, 'front', studioConfig)}
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-xs font-semibold text-gray-500 mb-2">Card Back</span>
                    ${renderSingleCard(s, school, 'back', studioConfig)}
                </div>
            `;
            document.getElementById('idc-preview-modal').classList.remove('hidden');
        },

        printPreview() { if (_previewStudent) printSelectedCards([_previewStudent]); },

        printSelected() {
            const list = filtered.filter(s => selected.has(s.id));
            if (!list.length) { alert('Select at least one student card checkbox to print.'); return; }
            printSelectedCards(list);
        },

        // ── Profile CRUD Modals ─────────────────────────────────────────────
        openModal(editId) {
            _pendingPhoto = null;
            const isEdit = !!editId;
            const s = isEdit ? allStudents.find(x => x.id === editId) : null;

            document.getElementById('idc-modal-title').textContent = isEdit ? 'Edit Student Details' : 'Add New Student Record';
            document.getElementById('idc-save-label').textContent  = isEdit ? 'Save Settings' : 'Add Student';

            const delBtn = document.getElementById('idc-delete-btn');
            if (delBtn) delBtn.classList.toggle('hidden', !isEdit);

            setField('idc-edit-id',      isEdit ? s.id : '');
            setField('idc-field-id',     isEdit ? s.id : '');
            setField('idc-field-name',   isEdit ? s.name : '');
            setField('idc-field-class',  isEdit ? s.className : '');
            setField('idc-field-gender', isEdit ? s.gender : '');
            setField('idc-field-dob',    isEdit ? s.dob : '');
            setField('idc-field-blood',  isEdit ? s.bloodGroup : '');
            setField('idc-field-session',isEdit ? s.session : '2024/2025');
            setField('idc-field-phone',  isEdit ? s.phone : '');

            const pp = document.getElementById('idc-photo-preview');
            if (pp) {
                if (isEdit && s.photo) pp.innerHTML = `<img src="${s.photo}" class="w-full h-full object-cover rounded-lg">`;
                else pp.textContent = isEdit ? (s.emoji || '👤') : '👤';
            }

            const fi = document.getElementById('idc-photo-upload');
            if (fi) fi.value = '';

            document.getElementById('idc-form-modal').classList.remove('hidden');
        },

        closeModal() {
            document.getElementById('idc-form-modal').classList.add('hidden');
            _pendingPhoto = null;
        },

        handlePhotoUpload(input) {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                _pendingPhoto = e.target.result;
                const pp = document.getElementById('idc-photo-preview');
                if (pp) pp.innerHTML = `<img src="${_pendingPhoto}" class="w-full h-full object-cover rounded-lg">`;
            };
            reader.readAsDataURL(file);
        },

        saveStudent() {
            const name = getField('idc-field-name');
            const cls  = getField('idc-field-class');
            if (!name) { alert('Please enter the student\'s full name.'); return null; }
            if (!cls)  { alert('Please select a class.'); return null; }

            const editId   = getField('idc-edit-id');
            const existing = editId ? allStudents.find(s => s.id === editId) : null;
            const customId = getField('idc-field-id');

            const nextIdGen = () => {
                if (allStudents.length === 0) return 'STU0001';
                const nums = allStudents.map(s => parseInt((s.id || '0').replace(/\D/g, ''), 10) || 0);
                return `STU${String(Math.max(...nums) + 1).padStart(4, '0')}`;
            };

            const student = {
                id:         existing ? existing.id : (customId || nextIdGen()),
                name,
                className:  cls,
                gender:     getField('idc-field-gender'),
                dob:        getField('idc-field-dob'),
                bloodGroup: getField('idc-field-blood'),
                session:    getField('idc-field-session') || '2024/2025',
                phone:      getField('idc-field-phone'),
                emoji:      existing ? existing.emoji : PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
                photo:      _pendingPhoto !== null ? _pendingPhoto : (existing ? existing.photo : null),
                nfc_uid:    existing ? existing.nfc_uid : null
            };

            if (existing) {
                allStudents[allStudents.findIndex(s => s.id === editId)] = student;
            } else {
                allStudents.unshift(student);
            }
            saveStudents();
            filtered = [...allStudents];
            this.filter();
            this.closeModal();
            return student;
        },

        saveAndPrint() {
            const s = this.saveStudent();
            if (s) printSelectedCards([s]);
        },

        deleteStudent() {
            const editId = getField('idc-edit-id');
            if (!editId) return;
            if (!confirm(`Delete student record ${editId}? This cannot be undone.`)) return;
            const idx = allStudents.findIndex(s => s.id === editId);
            if (idx !== -1) {
                allStudents.splice(idx, 1);
                selected.delete(editId);
                saveStudents();
                filtered = [...allStudents];
                this.filter();
                this.closeModal();
            }
        }
    };

    // ── Global USB keyboard wedge scanner listener for Binding Modal ───────
    document.addEventListener('keydown', (e) => {
        if (!nfcBindingStudentId) return;

        const currentTime = Date.now();
        if (currentTime - nfcScanTimeout > 50) {
            nfcScanBuffer = "";
        }
        nfcScanTimeout = currentTime;

        if (e.key.length === 1) {
            nfcScanBuffer += e.key;
        }

        if (e.key === 'Enter') {
            if (nfcScanBuffer.length >= 6) {
                e.preventDefault();
                console.log("USB Wedge Bind Reader Detected:", nfcScanBuffer);
                window.idCardApp.processCardBinding(nfcScanBuffer);
                nfcScanBuffer = "";
            }
        }
    });

    // Listen for global theme color shifts to live update the Design Studio preview canvas
    window.addEventListener('themeChanged', () => {
        renderStudioPreview();
    });

    // Initial table and preview draws
    renderTable();
})();
