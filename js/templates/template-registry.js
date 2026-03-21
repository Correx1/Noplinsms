// ============================================================
// TEMPLATE REGISTRY — Central hub for all result sheet templates
// ============================================================
window.TEMPLATE_REGISTRY = {};

// ----- PAYLOAD ASSEMBLER -----
// Builds a unified PrintPayload from raw record data + settings + profile + evals
window.buildPrintPayload = function(rec, opts) {
    const settings = opts.settings || {};
    const profile  = opts.profile  || {};
    const evals    = opts.evals    || { remark: '', domains: {}, psychomotor: {} };
    const mode     = opts.mode     || 'term'; // 'term' | 'session'

    const themeRaw = localStorage.getItem('sms_theme_settings');
    const theme    = themeRaw ? JSON.parse(themeRaw) : {};

    const promoteRule = parseInt(localStorage.getItem('sms_promotion_rule') || 50);
    const isPromoted  = parseFloat(rec.average) >= promoteRule;

    return {
        // School Branding
        school: {
            name:       profile.name    || 'My School',
            address:    profile.address || '123 Education Street',
            motto:      profile.motto   || 'Knowledge is Power',
            logo:       profile.logo    || '../../assets/images/logo.png',
            email:      profile.email   || '',
            phone:      profile.phone   || '',
            website:    profile.website || '',
            contact:    `${profile.email || ''} ${profile.phone ? '| ' + profile.phone : ''}`.trim(),
            themeColor: theme.primaryColor || '#1e3a8a'
        },

        // Student
        student: {
            name:   rec.student.name   || '',
            id:     rec.student.id     || '',
            roll:   rec.student.roll   || '',
            class:  opts.classValue    || rec.student.class || '',
            gender: rec.student.gender || '',
            dob:    rec.student.dob    || '',
            photo:  rec.student.photo  || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.student.name || 'S')}&background=f3f4f6&color=1e3a8a&size=128`
        },

        // Context
        context: {
            term:       opts.termValue    || rec.student.term || '',
            session:    opts.sessionValue || settings.session || '2024/2025',
            noInClass:  rec.sectionCount  || '',
            mode:       mode
        },

        // Attendance
        attendance: {
            timesOpened:  settings.schoolOpened || rec.attendance?.timesOpened  || '',
            timesPresent: rec.attendance?.present || rec.attendance?.timesPresent || '',
            timesAbsent:  rec.attendance?.absent  || rec.attendance?.timesAbsent  || ''
        },

        // Dates
        dates: {
            closingDate:    settings.closingDate    || '',
            resumptionDate: settings.resumptionDate || settings.resumption || '',
            nextTermBegins: settings.resumption     || ''
        },

        // Academic Performance
        subjects:  rec.subjects  || [],
        structure: rec.structure || { components: [] },

        // Summary
        summary: {
            grandTotal:      rec.grandTotal || 0,
            average:         rec.average    || '0',
            percentage:      rec.average    || '0',
            position:        rec.position   || '',
            sectionPosition: rec.sectionPosition || '',
            sectionAverage:  rec.sectionAverage  || '',
            isPromoted:      isPromoted,
            promotionStatus: isPromoted ? 'PROMOTED' : 'NOT PROMOTED'
        },

        // Evaluation
        evaluation: {
            teacherRemark:     evals.remark            || '',
            headTeacherRemark: evals.headTeacherRemark  || '',
            principalRemark:   evals.principalRemark    || '',
            affectiveDomains:  evals.domains            || {},
            psychomotorDomains: evals.psychomotor       || {}
        },

        // Bills
        bills: evals.bills || {},

        // Grading Keys (from gradeBoundariesData)
        gradingKeys: (function() {
            const raw = localStorage.getItem('gradeBoundariesData');
            if (raw) {
                try { return JSON.parse(raw).sort((a,b) => b.min - a.min); } catch(e) {}
            }
            return [
                { grade: 'A', min: 70, max: 100, remark: 'Distinction' },
                { grade: 'B', min: 60, max: 69,  remark: 'Credit' },
                { grade: 'C', min: 50, max: 59,  remark: 'Pass' },
                { grade: 'D', min: 40, max: 49,  remark: 'Fair' },
                { grade: 'F', min: 0,  max: 39,  remark: 'Fail' }
            ];
        })(),

        // Signatories
        signatories: {
            teacher: {
                name:      settings.headteacherName  || '',
                title:     settings.headteacherTitle  || 'Class Teacher',
                signature: settings.headteacherSign   || null
            },
            principal: {
                name:      settings.principalName  || '',
                title:     settings.principalTitle  || 'Principal',
                signature: settings.principalSign   || null
            }
        },

        // Domains list from settings (for templates that need the full list)
        domainsList:     settings.domains     || [],
        psychomotorList: settings.psychomotor || []
    };
};

// ----- TEMPLATE RENDER DISPATCHER -----
// Called by all 3 JS files to render whichever template is active
window.renderTemplate = function(payload) {
    const tpl = payload._templateId || 'classic';
    const mode = payload.context.mode || 'term';
    const reg = window.TEMPLATE_REGISTRY[tpl];

    if (!reg) {
        console.warn(`Template "${tpl}" not found, falling back to classic`);
        const fallback = window.TEMPLATE_REGISTRY['classic'];
        if (!fallback) return '<div style="padding:40px;text-align:center;font-size:18px;color:red;">No templates loaded.</div>';
        return mode === 'session' ? fallback.renderSession(payload) : fallback.renderTerm(payload);
    }

    return mode === 'session' ? reg.renderSession(payload) : reg.renderTerm(payload);
};

// ----- GET TEMPLATE CAPABILITIES -----
window.getTemplateCapabilities = function(tplId) {
    const reg = window.TEMPLATE_REGISTRY[tplId];
    if (!reg) return {};
    return reg.capabilities || {};
};

console.log('Template Registry initialized.');
