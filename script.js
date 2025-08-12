const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("script.js loaded");

const headerMap = {
    icon: 'Icon', name: 'Name', itemtype: 'Type', ac: 'AC', hp: 'HP', mana: 'Mana',
    astr: 'STR', asta: 'STA', adex: 'DEX', aagi: 'AGI', awis: 'WIS', aint: 'INT', acha: 'CHA',
    mr: 'MR', cr: 'CR', fr: 'FR', pr: 'PR', dr: 'DR'
};

const CLASS_MAP = {
    1: "Warrior", 2: "Cleric", 4: "Paladin", 8: "Ranger", 16: "Shadow Knight", 32: "Druid",
    64: "Monk", 128: "Bard", 256: "Rogue", 512: "Shaman", 1024: "Necromancer", 2048: "Wizard",
    4096: "Magician", 8192: "Enchanter", 16384: "Beastlord", 32768: "Berserker"
};

const RACE_MAP = {
    1: "Human", 2: "Barbarian", 4: "Erudite", 8: "Wood Elf", 16: "High Elf", 32: "Dark Elf",
    64: "Half Elf", 128: "Dwarf", 256: "Troll", 512: "Ogre", 1024: "Halfling", 2048: "Gnome",
    4096: "Iksar", 8192: "Vah Shir", 16384: "Froglok", 32768: "Drakkin"
};

const SLOT_MAP = {
    1: "Charm", 2: "Ear", 4: "Head", 8: "Face", 16: "Ear", 32: "Neck", 64: "Shoulder",
    128: "Arms", 256: "Back", 512: "Bracer", 1024: "Bracer", 2048: "Range", 4096: "Hands",
    8192: "Primary", 16384: "Secondary", 32768: "Ring", 65536: "Ring", 131072: "Chest",
    262144: "Legs", 524288: "Feet", 1048576: "Waist", 2097152: "Powersource", 4194304: "Ammo"
};

function decodeBitmask(mask, map) {
    const names = [];
    for (const key in map) {
        if (mask & key) {
            names.push(map[key]);
        }
    }
    return [...new Set(names)];
}

// Global variables that will be initialized in DOMContentLoaded
let tooltip;
let breakdownContainer;

function showItemTooltip(item, event) {
    let flags = [];
    if (item.magic) flags.push('MAGIC ITEM');
    if (item.loregroup >= 0 && item.loregroup !== null) flags.push('LORE ITEM');
    if (item.nodrop === 0) flags.push('NO DROP');
    if (item.attuneable) flags.push('ATTUNEABLE');

    let html = `<div class="tooltip-title">${item.name}</div>`;
    if (flags.length > 0) { html += `<div class="tooltip-flags">${flags.join(' ')}</div>`; }

    const slots = decodeBitmask(item.slots, SLOT_MAP);
    if (slots.length > 0) {
        html += `<div class="tooltip-section"><span class="tooltip-stat-label">Slot:</span> <span class="tooltip-stat-value">${slots.join(', ')}</span></div>`;
    }

    let statsHtml = '';
    const statPairs = { 'STR': item.astr, 'DEX': item.adex, 'STA': item.asta, 'CHA': item.acha, 'WIS': item.awis, 'INT': item.aint, 'AGI': item.aagi };
    const resistPairs = { 'SV MAGIC': item.mr, 'SV FIRE': item.fr, 'SV COLD': item.cr, 'SV POISON': item.pr, 'SV DISEASE': item.dr };
    for(const [key, value] of Object.entries(statPairs)) {
        if(value) statsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">+${value}</span>`;
    }
     if (item.hp) statsHtml += `<span class="tooltip-stat-label">HP:</span><span class="tooltip-stat-value">+${item.hp}</span>`;
    if (item.mana) statsHtml += `<span class="tooltip-stat-label">MANA:</span><span class="tooltip-stat-value">+${item.mana}</span>`;
    if (statsHtml) { html += `<div class="tooltip-section">${statsHtml}</div>`; }

    let resistsHtml = '';
    for(const [key, value] of Object.entries(resistPairs)) {
        if(value) resistsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">+${value}</span>`;
    }
    if(resistsHtml) { html += `<div class="tooltip-section">${resistsHtml}</div>`; }

    const classes = decodeBitmask(item.classes, CLASS_MAP);
    if (classes.length > 0 && classes.length < Object.keys(CLASS_MAP).length) {
        html += `<div class="tooltip-section"><span class="tooltip-stat-label">Class:</span> <span class="tooltip-stat-value">${classes.join(', ')}</span></div>`;
    }
    const races = decodeBitmask(item.races, RACE_MAP);
     if (races.length > 0 && races.length < Object.keys(RACE_MAP).length) {
        html += `<div class="tooltip-section"><span class="tooltip-stat-label">Race:</span> <span class="tooltip-stat-value">${races.join(', ')}</span></div>`;
    }

    if (item.lore) { html += `<div class="tooltip-lore">${item.lore}</div>`; }

    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 20) + 'px';
    tooltip.style.top = (event.pageY + 20) + 'px';
}

function hideTooltip() {
    if(tooltip) tooltip.style.display = 'none';
}

function createChecklistItem(text) {
    const label = document.createElement('label');
    label.className = 'checklist-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + text));
    return label;
}

function renderObtainmentTree(obtainmentData) {
    if (!obtainmentData || (!obtainmentData.components && !obtainmentData.sources)) {
        const textNode = document.createElement('span');
        textNode.textContent = ' (Details not available)';
        textNode.className = 'unknown-source';
        return textNode;
    }

    const ul = document.createElement('ul');
    ul.className = 'obtainment-list';

    if (obtainmentData.type === 'craft' || obtainmentData.type === 'quest') {
        const recipe = obtainmentData;
        const li = document.createElement('li');
        let craftText = `Craft with ${recipe.tradeskill || 'N/A'} (Trivial: ${recipe.trivial || 'N/A'})`;
        if (recipe.type === 'quest') {
            craftText = `Quest Hand-in`;
        }
        li.appendChild(createChecklistItem(craftText));

        if (recipe.notes) {
            const notesP = document.createElement('p');
            notesP.className = 'quest-notes';
            notesP.textContent = `to ${recipe.notes}`;
            li.appendChild(notesP);
        }

        const componentsUl = document.createElement('ul');
        if (recipe.components) {
            recipe.components.forEach(comp => {
                const itemData = comp.item_data;
                const compLi = document.createElement('li');
                const label = document.createElement('label');
                label.className = 'checklist-item';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('click', (e) => e.stopPropagation());
                const icon = document.createElement('img');
                icon.src = `https://www.pqdi.cc/static/icons/item_${itemData.icon}.png`;
                icon.className = 'item-icon';
                icon.addEventListener('mouseenter', (e) => showItemTooltip(itemData, e));
                icon.addEventListener('mouseleave', hideTooltip);
                const text = document.createElement('span');
                text.className = 'item-name-link';
                text.textContent = ` ${itemData.qty} x ${itemData.name}`;
                text.title = 'Click to see breakdown for this component';
                text.addEventListener('click', (e) => {
                    e.preventDefault();
                    getObtainInfo(itemData.id, itemData.name, itemData.icon);
                });
                label.appendChild(checkbox);
                label.appendChild(icon);
                label.appendChild(text);
                compLi.appendChild(label);
                if (comp.obtainment) {
                    compLi.appendChild(renderObtainmentTree(comp.obtainment));
                }
                componentsUl.appendChild(compLi);
            });
        }
        li.appendChild(componentsUl);
        ul.appendChild(li);
    } else if (obtainmentData.type === 'obtainment') {
        if (!obtainmentData.sources) {
             const textNode = document.createElement('span');
             textNode.textContent = ' (Ground Spawn or other)';
             textNode.className = 'unknown-source';
             return textNode;
        }
        // Group sources by zone
        const sourcesByZone = obtainmentData.sources.reduce((acc, source) => {
            const zone = source.zone || 'Unknown Zone';
            if (!acc[zone]) {
                acc[zone] = [];
            }
            acc[zone].push(source);
            return acc;
        }, {});

        for (const zoneName in sourcesByZone) {
            const li = document.createElement('li');
            const details = document.createElement('details');
            details.open = true; // Default to open
            const summary = document.createElement('summary');
            const summaryText = `Obtained from <span class="zone-name">${zoneName}</span>`;
            summary.innerHTML = summaryText;
            details.appendChild(summary);

            const npcUl = document.createElement('ul');
            // Sort vendors before mobs
            sourcesByZone[zoneName].sort((a, b) => {
                if (a.type === 'vendor' && b.type !== 'vendor') return -1;
                if (a.type !== 'vendor' && b.type === 'vendor') return 1;
                return a.name.localeCompare(b.name);
            }).forEach(source => {
                const npcLi = document.createElement('li');
                npcLi.className = 'drop-source';
                const npcSpan = document.createElement('span');
                npcSpan.className = source.type === 'vendor' ? 'vendor-name' : 'npc-name';
                npcSpan.textContent = source.name;
                npcLi.appendChild(npcSpan);
                npcUl.appendChild(npcLi);
            });

            details.appendChild(npcUl);
            li.appendChild(details);
            ul.appendChild(li);
        }
    }
    return ul;
}

function renderBreakdown(data, itemName, itemIcon) {
    breakdownContainer.innerHTML = '';
    const header = document.createElement('h3');

    if (itemIcon) {
        const img = document.createElement('img');
        img.src = `https://www.pqdi.cc/static/icons/item_${itemIcon}.png`;
        img.className = 'breakdown-header-icon';
        header.appendChild(img);
    }

    header.appendChild(document.createTextNode(` Checklist for ${itemName}`));
    breakdownContainer.appendChild(header);

    if (data) {
        breakdownContainer.appendChild(renderObtainmentTree(data));
    } else {
        breakdownContainer.innerHTML += '<p>No obtainment information found.</p>';
    }
}

async function getObtainInfo(itemId, itemName, itemIcon) {
    breakdownContainer.innerHTML = `<p>Fetching details for ${itemName}...</p>`;
    // Pass the second argument for cycle detection, starting with an empty array.
    const { data, error } = await supabaseClient.rpc('get_full_obtainment_details', { p_item_id: itemId, p_visited: [] });
    if (error) {
        console.error(`Error fetching details for ${itemName}:`, error);
        breakdownContainer.innerHTML = `<p>Error fetching details: ${error.message}</p>`;
        return;
    }
    renderBreakdown(data, itemName, itemIcon);
}

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    breakdownContainer = document.getElementById('breakdown-container'); // Initialize global
    tooltip = document.getElementById('tooltip'); // Initialize global
    const viewToggleButton = document.getElementById('view-toggle-button');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };
    let currentView = 'grid';

    function sortAndRender() {
        if (currentView === 'table' && currentSort.column) {
            currentItems.sort((a, b) => {
                const valA = a[currentSort.column];
                const valB = b[currentSort.column];
                const isNumeric = !isNaN(parseFloat(valA)) && isFinite(valA) && !isNaN(parseFloat(valB)) && isFinite(valB);
                let comparison = isNumeric ? (parseFloat(valA) || 0) - (parseFloat(valB) || 0) : (valA || '').toString().localeCompare((valB || '').toString());
                return currentSort.direction === 'asc' ? comparison : -comparison;
            });
        }
        drawResults();
    }

    function handleHeaderClick(e) {
        const column = e.target.dataset.column;
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        sortAndRender();
    }

    function drawGridView() {
        resultsContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'results-grid';
        currentItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'grid-item';
            itemDiv.addEventListener('click', () => getObtainInfo(item.id, item.name, item.icon));

            const img = document.createElement('img');
            img.src = `https://www.pqdi.cc/static/icons/item_${item.icon || 1171}.png`;
            img.alt = item.name;
            itemDiv.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;
            itemDiv.appendChild(nameSpan);

            img.addEventListener('mouseenter', (e) => showItemTooltip(item, e));
            img.addEventListener('mouseleave', hideTooltip);
            nameSpan.addEventListener('mouseenter', (e) => showItemTooltip(item, e));
            nameSpan.addEventListener('mouseleave', hideTooltip);

            itemDiv.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX + 20) + 'px';
                tooltip.style.top = (e.pageY + 20) + 'px';
            });

            grid.appendChild(itemDiv);
        });
        resultsContainer.appendChild(grid);
    }

    function drawTableView() {
        resultsContainer.innerHTML = '';
        if (!currentItems || currentItems.length === 0) return;
        const table = document.createElement('table');
        table.className = 'results-table';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(headerMap);
        headers.forEach(key => {
            const th = document.createElement('th');
            th.textContent = headerMap[key];
            th.dataset.column = key;
            th.addEventListener('click', handleHeaderClick);
            if (currentSort.column === key) {
                th.textContent += currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        currentItems.forEach(item => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => getObtainInfo(item.id, item.name, item.icon));
            headers.forEach(headerKey => {
                const cell = document.createElement('td');
                if (headerKey === 'icon') {
                    if (item.icon) {
                        const img = document.createElement('img');
                        img.src = `https://www.pqdi.cc/static/icons/item_${item.icon}.png`;
                        img.alt = 'Icon';
                        img.width = 24;
                        img.height = 24;
                        cell.appendChild(img);
                        cell.addEventListener('mouseenter', (e) => showItemTooltip(item, e));
                        cell.addEventListener('mouseleave', hideTooltip);
                    }
                } else {
                    cell.textContent = item[headerKey] || '0';
                }
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        resultsContainer.appendChild(table);
    }

    function drawResults() {
        if (currentView === 'grid') {
            drawGridView();
        } else {
            drawTableView();
        }
    }

    function renderNewResults(items) {
        currentItems = items;
        sortAndRender();
    }

    viewToggleButton.addEventListener('click', () => {
        currentView = currentView === 'grid' ? 'table' : 'grid';
        viewToggleButton.textContent = currentView === 'grid' ? 'Switch to Table View' : 'Switch to Grid View';
        drawResults();
    });

    async function performSearch(query) {
        const { data, error } = await query;
        if (error) { resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`; return; }
        renderNewResults(data || []);
    }

    testButton.addEventListener('click', () => {
        resultsContainer.innerHTML = '<p>Fetching all data...</p>';
        performSearch(supabaseClient.from('items').select('*'));
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        if (!searchTerm) { resultsContainer.innerHTML = '<p>Please enter a search term.</p>'; return; }
        resultsContainer.innerHTML = `<p>Searching for "${searchTerm}"...</p>`;
        performSearch(supabaseClient.from('items').select('*').ilike('name', `%${searchTerm}%`));
    });

    // Initial draw to ensure the grid view is shown on page load
    drawResults();
});
