// Grading Structures & Components Logic
(function() {
    console.log('Grading Components Setup Started');

    // MOCK CLASSES to populate the Structure target class checkboxes
    const ALL_CLASSES = [
        "Nursery 1", "Nursery 2", "Primary 1", "Primary 2", "Primary 3",
        "Primary 4", "Primary 5", "Primary 6", "JSS1", "JSS2", "JSS3",
        "SS1", "SS2", "SS3"
    ];

    // default mock structures
    const defaultStructures = [
        {
            id: 'STR-Junior',
            name: 'Junior Secondary (JSS) Grading',
            classes: ['JSS1', 'JSS2', 'JSS3'],
            components: [
                { id: 'C3', name: 'CA 1', weight: 10, assessment: 'ASM-First CA' },
                { id: 'C4', name: 'CA 2', weight: 30, assessment: 'ASM-MidTerm' },
                { id: 'C5', name: 'Terminal Exam', weight: 60, assessment: 'EXM-Final' }
            ]
        }
    ];

    let gradingStructuresData = [];

    function loadStructures() {
        const stored = localStorage.getItem('gradingStructuresData');
        if (stored && JSON.parse(stored).length > 0) {
            let parsed = JSON.parse(stored);
            // MIGRATION: Clean legacy cache of whitespace bugs to perfectly match backend schema
            parsed.forEach(p => {
                if(p.classes) p.classes = p.classes.map(clsStr => clsStr.replace(/\s+/g, ''));
            });
            gradingStructuresData = parsed;
        } else {
            gradingStructuresData = JSON.parse(JSON.stringify(defaultStructures));
            localStorage.setItem('gradingStructuresData', JSON.stringify(gradingStructuresData));
        }

        populateClassesCheckboxes();
        renderStructures();
    }

    function populateClassesCheckboxes() {
        const container = document.getElementById('struct-classes-container');
        if(!container) return;
        
        container.innerHTML = '';
        
        ALL_CLASSES.forEach(cls => {
            const label = document.createElement('label');
            label.className = 'inline-flex items-center';
            label.innerHTML = `
                <input type="checkbox" value="${cls}" name="struct-class" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-500">
                <span class="ml-2 text-sm text-gray-900 dark:text-gray-300">${cls}</span>
            `;
            container.appendChild(label);
        });
    }

    function renderStructures() {
        const container = document.getElementById('structures-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (gradingStructuresData.length === 0) {
            container.innerHTML = '<div class="p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500">No Grading Structures defined yet. Click "Create New Structure" to begin.</div>';
            return;
        }

        gradingStructuresData.forEach(struct => {
            let totalWeight = struct.components.reduce((sum, c) => sum + c.weight, 0);
            
            // Build Components Rows
            let rowsHtml = '';
            if (struct.components.length === 0) {
                rowsHtml = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No components added yet.</td></tr>';
            } else {
                struct.components.forEach(comp => {
                    let weightStyle = comp.weight >= 50 ? 'font-bold text-gray-900 dark:text-white' : 'font-normal';
                    let asmText = comp.assessment || '<span class="italic text-gray-400">Manual Entry</span>';
                    
                    rowsHtml += `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td class="px-6 py-3 font-medium text-gray-900 dark:text-white">${comp.name}</td>
                            <td class="px-6 py-3 ${weightStyle}">${comp.weight}%</td>
                            <td class="px-6 py-3 text-xs">${asmText}</td>
                            <td class="px-6 py-3 text-right">
                                <button type="button" onclick="window.editComponent('${struct.id}', '${comp.id}')" class="text-primary-600 hover:underline font-medium text-sm mr-2"><i class="fas fa-edit"></i></button>
                                <button type="button" onclick="window.deleteComponent('${struct.id}', '${comp.id}')" class="text-red-600 hover:underline font-medium text-sm"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }

            // Total Weight Color logic
            let totalClass = 'text-green-600';
            if (totalWeight > 100) totalClass = 'text-red-600';
            else if (totalWeight < 100) totalClass = 'text-yellow-600';

            const block = document.createElement('div');
            block.className = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm';
            block.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 gap-2">
                    <div>
                        <h2 class="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                           <i class="fas fa-sitemap text-primary-600 mr-2 text-xs sm:text-sm"></i> ${struct.name}
                        </h2>
                        <p class="text-[10px] sm:text-xs text-gray-500 mt-1 max-w-lg line-clamp-1 sm:line-clamp-none">Targets: ${struct.classes.join(', ')}</p>
                    </div>
                    <div class="flex items-center justify-end gap-2 mt-2 sm:mt-0">
                        <button type="button" onclick="window.editStructure('${struct.id}')" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors">Edit</button>
                        <button type="button" onclick="window.deleteStructure('${struct.id}')" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors">Delete</button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-[10px] sm:text-xs text-gray-700 uppercase bg-gray-100/50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 whitespace-nowrap">Component Name</th>
                                <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 w-12 sm:w-24">Weight</th>
                                <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 hidden md:table-cell">Linked Assessment</th>
                                <th scope="col" class="px-2 sm:px-6 py-2 sm:py-3 text-right whitespace-nowrap w-16 sm:w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        <tfoot>
                            <tr class="bg-gray-50 dark:bg-gray-700/30">
                                <td class="px-2 sm:px-6 py-2 sm:py-3 text-right font-medium text-gray-900 dark:text-white text-[10px] sm:text-sm">Total Configured:</td>
                                <td class="px-2 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg ${totalClass}">${totalWeight}%</td>
                                <td class="px-2 sm:px-6 py-2 sm:py-3 text-right" colspan="2">
                                     <button type="button" onclick="window.openComponentModal('${struct.id}')" class="text-primary-600 dark:text-primary-400 font-bold hover:underline py-1 px-1 sm:px-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-xs sm:text-sm whitespace-nowrap">
                                        + Add Component
                                     </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- ADDED SAVE BUTTON PER REQUEST -->
                <div class="px-3 sm:px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end">
                    <button type="button" onclick="alert('Successfully Saved \`${struct.name}\` Architecture!')" class="bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg shadow-sm transition-colors flex items-center">
                        <i class="fas fa-save mr-2"></i> Save Structure
                    </button>
                </div>
            `;
            container.appendChild(block);
        });
    }

    // --- STRUCTURE MODAL ---
    window.openStructureModal = function(id = null) {
        document.getElementById('structure-form').reset();
        document.getElementById('struct-id').value = '';
        document.getElementById('structure-modal-title').textContent = 'Create Grading Structure';
        
        // Reset checkboxes
        document.querySelectorAll('input[name="struct-class"]').forEach(cb => cb.checked = false);

        if(id) {
            document.getElementById('structure-modal-title').textContent = 'Edit Grading Structure';
            window.editStructure(id); // called externally or explicitly inside
            return;
        }

        const modal = document.getElementById('structure-modal');
        if(modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    window.closeStructureModal = function() {
        const modal = document.getElementById('structure-modal');
        if(modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    };

    window.editStructure = function(id) {
        const struct = gradingStructuresData.find(s => s.id === id);
        if(!struct) return;
        
        document.getElementById('structure-modal-title').textContent = 'Edit Grading Structure Mapping';
        document.getElementById('struct-id').value = struct.id;
        document.getElementById('struct-name').value = struct.name;

        // Check checkboxes
        document.querySelectorAll('input[name="struct-class"]').forEach(cb => {
            cb.checked = struct.classes.includes(cb.value);
        });

        const modal = document.getElementById('structure-modal');
        if(modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    window.saveStructure = function() {
        const id = document.getElementById('struct-id').value;
        const name = document.getElementById('struct-name').value;
        
        const selectedClasses = Array.from(document.querySelectorAll('input[name="struct-class"]:checked')).map(cb => cb.value);
        if(selectedClasses.length === 0) {
            alert('Please select at least one target class.');
            return;
        }

        // Strict 1:1 Conflict Validation
        for(let cls of selectedClasses) {
            const conflict = gradingStructuresData.find(s => s.id !== id && s.classes.includes(cls));
            if(conflict) {
                alert(`Conflict detected: The class "${cls}" is already assigned to the "${conflict.name}" structure.\n\nA class can only belong to exactly one Grading Structure to avoid conflicts.`);
                return;
            }
        }

        if(id) {
            const index = gradingStructuresData.findIndex(s => s.id === id);
            if(index !== -1) {
                gradingStructuresData[index].name = name;
                gradingStructuresData[index].classes = selectedClasses;
            }
        } else {
            gradingStructuresData.push({
                id: 'STR-' + Date.now(),
                name: name,
                classes: selectedClasses,
                components: []
            });
        }

        syncAndRender();
        window.closeStructureModal();
    };

    window.deleteStructure = function(id) {
        if(confirm('Warning: Deleting this structure removes all sub-components mapped to it. Are you sure?')) {
            gradingStructuresData = gradingStructuresData.filter(s => s.id !== id);
            syncAndRender();
        }
    };

    // --- COMPONENT MODAL ---
    window.openComponentModal = function(structId, compId = null) {
        const struct = gradingStructuresData.find(s => s.id === structId);
        if(!struct) return;

        document.getElementById('component-form').reset();
        document.getElementById('comp-id').value = '';
        document.getElementById('comp-struct-id').value = structId;
        document.getElementById('comp-target-display').textContent = struct.name;
        document.getElementById('component-modal-title').getContext = 'Add Component';

        if(compId) {
            document.getElementById('component-modal-title').getContext = 'Edit Component';
            const comp = struct.components.find(c => c.id === compId);
            if(comp) {
                document.getElementById('comp-id').value = comp.id;
                document.getElementById('comp-name').value = comp.name;
                document.getElementById('comp-weight').value = comp.weight;
                document.getElementById('comp-assessment').value = comp.assessment;
            }
        }

        const modal = document.getElementById('component-modal');
        if(modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    window.closeComponentModal = function() {
        const modal = document.getElementById('component-modal');
        if(modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    };

    window.editComponent = function(structId, compId) {
        window.openComponentModal(structId, compId);
    };

    window.saveComponent = function() {
        const structId = document.getElementById('comp-struct-id').value;
        const compId = document.getElementById('comp-id').value;
        
        const name = document.getElementById('comp-name').value;
        const weight = parseInt(document.getElementById('comp-weight').value) || 0;
        const assessment = document.getElementById('comp-assessment').value;

        const struct = gradingStructuresData.find(s => s.id === structId);
        if(!struct) return;

        // Validation: Over 100% check
        let existingWeightSum = 0;
        struct.components.forEach(c => {
            // Exclude current component if we are editing it, so we can calculate cleanly
            if(c.id !== compId) {
                existingWeightSum += parseInt(c.weight);
            }
        });

        if((existingWeightSum + weight) > 100) {
            alert(`Cannot save this component. The maximum structure limit is 100%. Currently this structure has ${existingWeightSum}%, so you can only add up to ${100 - existingWeightSum}%.`);
            return;
        }

        if(compId) {
            const compIndex = struct.components.findIndex(c => c.id === compId);
            if(compIndex !== -1) {
                struct.components[compIndex] = { id: compId, name, weight, assessment };
            }
        } else {
            struct.components.push({
                id: 'CMP-' + Date.now(),
                name, weight, assessment
            });
        }

        syncAndRender();
        window.closeComponentModal();
    };

    window.deleteComponent = function(structId, compId) {
        if(confirm('Delete component from this structure?')) {
            const struct = gradingStructuresData.find(s => s.id === structId);
            if(struct) {
                struct.components = struct.components.filter(c => c.id !== compId);
                syncAndRender();
            }
        }
    };

    // Shared Sync Storage & Render Engine
    function syncAndRender() {
        localStorage.setItem('gradingStructuresData', JSON.stringify(gradingStructuresData));
        renderStructures();
    }

    // Load Initial
    setTimeout(loadStructures, 100);
})();
