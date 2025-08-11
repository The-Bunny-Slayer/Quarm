const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const tooltip = document.getElementById('tooltip');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };

    // --- Tooltip Functions ---
    function showTooltip(item, event) {
        let content = '<h3>' + item.name + '</h3>';
        const details = document.createElement('dl');

        // Define a specific order for important stats, if desired
        const preferredOrder = ['procName', 'ac', 'hp', 'mana', 'astr', 'asta', 'adex', 'aagi', 'awis', 'aint', 'acha'];
        const displayedKeys = new Set(preferredOrder);

        // Add preferred stats first
        preferredOrder.forEach(key => {
            if (item[key] && item[key] !== 0 && item[key] !== -1) {
                const dt = document.createElement('dt');
                dt.textContent = key === 'procName' ? 'Proc Effect' : key;
                details.appendChild(dt);

                const dd = document.createElement('dd');
                dd.textContent = item[key];
                details.appendChild(dd);
            }
        });

        // Add remaining stats
        for (const key in item) {
            const value = item[key];
            if (!displayedKeys.has(key) && key !== 'id' && key !== 'name' && key !== 'proceffect' && value !== null && value !== 0 && value !== -1 && value !== '') {
                const dt = document.createElement('dt');
                dt.textContent = key;
                details.appendChild(dt);

                const dd = document.createElement('dd');
                dd.textContent = value;
                details.appendChild(dd);
            }
        }

        tooltip.innerHTML = content;
        tooltip.appendChild(details);
        tooltip.style.display = 'block';
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // --- Sorting and Rendering ---
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

        const headerSet = new Set();
        currentItems.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'id' && item[key] !== null && item[key] !== 0 && item[key] !== -1 && item[key] !== '' && key !== 'procName') {
                    headerSet.add(key);
                }
            });
        });
        const headers = Array.from(headerSet).sort();

        headers.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
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
            row.addEventListener('mouseenter', (e) => showTooltip(item, e));
            row.addEventListener('mouseleave', hideTooltip);
            row.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX + 15) + 'px';
                tooltip.style.top = (e.pageY + 15) + 'px';
            });

            headers.forEach(header => {
                const cell = document.createElement('td');
                cell.textContent = item[header] || '';
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

    // --- Event Listeners for Data Fetching ---
    async function fetchAndEnrich(query) {
        const { data: items, error } = await query;
        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            return;
        }
        if (!items || items.length === 0) {
            renderNewResults([]);
            return;
        }
        const enrichedItemPromises = items.map(async (item) => {
            if (item.proceffect && item.proceffect > 0) {
                const { data: spell } = await supabaseClient.from('spells_new').select('name').eq('id', item.proceffect).single();
                if (spell) return { ...item, procName: spell.name };
            }
            return item;
        });
        const enrichedItems = await Promise.all(enrichedItemPromises);
        renderNewResults(enrichedItems);
    }

    testButton.addEventListener('click', () => {
        resultsContainer.innerHTML = '<p>Fetching all data...</p>';
        fetchAndEnrich(supabaseClient.from('items').select('*'));
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }
        resultsContainer.innerHTML = `<p>Searching for "${searchTerm}"...</p>`;
        fetchAndEnrich(supabaseClient.from('items').select('*').ilike('name', `%${searchTerm}%`));
    });
});
