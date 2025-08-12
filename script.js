const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("script.js loaded");

const headerMap = {
    icon: 'Icon',
    name: 'Name',
    itemtype: 'Type',
    ac: 'AC',
    hp: 'HP',
    mana: 'Mana',
    astr: 'STR',
    asta: 'STA',
    adex: 'DEX',
    aagi: 'AGI',
    awis: 'WIS',
    aint: 'INT',
    acha: 'CHA',
    mr: 'MR',
    cr: 'CR',
    fr: 'FR',
    pr: 'PR',
    dr: 'DR'
};

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const breakdownContainer = document.getElementById('breakdown-container');
    const tooltip = document.getElementById('tooltip');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };

    // --- Tooltip Functions ---
    function showItemTooltip(item, event) {
        let flags = [];
        if (item.magic) flags.push('MAGIC ITEM');
        if (item.loregroup >= 0 && item.loregroup !== null) flags.push('LORE ITEM');
        if (item.nodrop === 0) flags.push('NO DROP');
        if (item.attuneable) flags.push('ATTUNEABLE');

        let html = `<div class="tooltip-title">${item.name}</div>`;
        if (flags.length > 0) {
            html += `<div class="tooltip-flags">${flags.join(' ')}</div>`;
        }

        let statsHtml = '';
        const statPairs = { 'STR': item.astr, 'DEX': item.adex, 'STA': item.asta, 'CHA': item.acha, 'WIS': item.awis, 'INT': item.aint, 'AGI': item.aagi };
        const resistPairs = { 'SV MAGIC': item.mr, 'SV FIRE': item.fr, 'SV COLD': item.cr, 'SV POISON': item.pr, 'SV DISEASE': item.dr };

        for(const [key, value] of Object.entries(statPairs)) {
            if(value) statsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">+${value}</span>`;
        }
        for(const [key, value] of Object.entries(resistPairs)) {
            if(value) statsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">+${value}</span>`;
        }
        if (item.hp) statsHtml += `<span class="tooltip-stat-label">HP:</span><span class="tooltip-stat-value">+${item.hp}</span>`;
        if (item.mana) statsHtml += `<span class="tooltip-stat-label">MANA:</span><span class="tooltip-stat-value">+${item.mana}</span>`;

        if (statsHtml) {
            html += `<div class="tooltip-section">${statsHtml}</div>`;
        }

        if (item.lore) {
            html += `<div class="tooltip-lore">${item.lore}</div>`;
        }

        tooltip.innerHTML = html;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 20) + 'px';
        tooltip.style.top = (event.pageY + 20) + 'px';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // --- Recursive Breakdown Rendering ---
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
        if (!obtainmentData || (obtainmentData.type === 'drop' && !obtainmentData.sources)) {
            const textNode = document.createElement('span');
            textNode.textContent = ' (Vendor or Ground Spawn)';
            textNode.className = 'unknown-source';
            return textNode;
        }

        const ul = document.createElement('ul');
        ul.className = 'obtainment-list';

        if (obtainmentData.type === 'craft') {
            const recipe = obtainmentData;
            const li = document.createElement('li');

            let craftText = `Craft with ${recipe.tradeskill || 'N/A'} (Trivial: ${recipe.trivial || 'N/A'})`;
            if (recipe.tradeskill === 100) { // Quest
                craftText = `Quest Hand-in`;
            }
            li.appendChild(createChecklistItem(craftText));

            if (recipe.notes) {
                const notesP = document.createElement('p');
                notesP.className = 'quest-notes';
                notesP.textContent = recipe.notes;
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
                        getObtainInfo(itemData.id, itemData.name);
                    });

                    label.appendChild(checkbox);
                    label.appendChild(icon);
                    label.appendChild(text);
                    compLi.appendChild(label);

                    if(comp.obtainment) {
                        compLi.appendChild(renderObtainmentTree(comp.obtainment));
                    }
                    componentsUl.appendChild(compLi);
                });
            }
            li.appendChild(componentsUl);
            ul.appendChild(li);

        } else if (obtainmentData.type === 'drop') {
            const sourcesByZone = obtainmentData.sources.reduce((acc, source) => {
                const zone = source.zone_name || 'Unknown Zone';
                if (!acc[zone]) acc[zone] = [];
                acc[zone].push(source.npc_name);
                return acc;
            }, {});

            for (const zoneName in sourcesByZone) {
                const li = document.createElement('li');
                const details = document.createElement('details');
                const summary = document.createElement('summary');

                const summaryText = `Dropped in <span class="zone-name">${zoneName}</span>`;
                summary.innerHTML = summaryText;
                details.appendChild(summary);

                const npcUl = document.createElement('ul');
                sourcesByZone[zoneName].forEach(npcName => {
                    const npcLi = document.createElement('li');
                    npcLi.className = 'drop-source';
                    const npcSpan = document.createElement('span');
                    npcSpan.className = 'npc-name';
                    npcSpan.textContent = npcName;
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

    function renderBreakdown(data, itemName) {
        breakdownContainer.innerHTML = '';
        const header = document.createElement('h3');
        header.textContent = `Checklist for ${itemName}`;
        breakdownContainer.appendChild(header);
        if (data) {
            breakdownContainer.appendChild(renderObtainmentTree(data));
        } else {
            breakdownContainer.innerHTML += '<p>No obtainment information found.</p>';
        }
    }

    async function getObtainInfo(itemId, itemName) {
        breakdownContainer.innerHTML = `<p>Fetching details for ${itemName}...</p>`;
        const { data, error } = await supabaseClient.rpc('get_full_obtainment_details', { p_item_id: itemId });

        if (error) {
            console.error(`Error fetching details for ${itemName}:`, error);
            breakdownContainer.innerHTML = `<p>Error fetching details: ${error.message}</p>`;
            return;
        }
        renderBreakdown(data, itemName);
    }

    // --- Main Table Rendering ---
    function sortAndRender() {
        if (currentSort.column) {
            currentItems.sort((a, b) => {
                const valA = a[currentSort.column];
                const valB = b[currentSort.column];
                const isNumeric = !isNaN(parseFloat(valA)) && isFinite(valA) && !isNaN(parseFloat(valB)) && isFinite(valB);
                let comparison = 0;
                if (isNumeric) {
                    comparison = parseFloat(valA) - parseFloat(valB);
                } else {
                    comparison = (valA || '').toString().localeCompare((valB || '').toString());
                }
                return currentSort.direction === 'asc' ? comparison : -comparison;
            });
        }
        drawTable();
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

    function drawTable() {
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
            row.addEventListener('click', () => getObtainInfo(item.id, item.name));

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

    function renderNewResults(items) {
        currentItems = items;
        currentSort = { column: 'name', direction: 'asc' };
        sortAndRender();
    }

    // --- Initial Data Loaders ---
    async function performSearch(query) {
        const { data, error } = await query;
        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            return;
        }
        renderNewResults(data || []);
    }

    testButton.addEventListener('click', () => {
        resultsContainer.innerHTML = '<p>Fetching all data...</p>';
        performSearch(supabaseClient.from('items').select('*'));
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }
        resultsContainer.innerHTML = `<p>Searching for "${searchTerm}"...</p>`;
        performSearch(supabaseClient.from('items').select('*').ilike('name', `%${searchTerm}%`));
    });
});
