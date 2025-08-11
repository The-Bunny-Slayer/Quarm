const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const breakdownContainer = document.getElementById('breakdown-container');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };

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
            li.appendChild(createChecklistItem(`Craft using ${recipe.tradeskill || 'N/A'} (Trivial: ${recipe.trivial || 'N/A'}) in a ${recipe.container || 'N/A'}`));

            const componentsUl = document.createElement('ul');
            if (recipe.components) {
                recipe.components.forEach(comp => {
                    const compLi = document.createElement('li');
                    // Add a click handler to the component to fetch its tree
                    const itemLabel = createChecklistItem(`${comp.qty} x ${comp.item_name}`);
                    itemLabel.style.cursor = 'pointer';
                    itemLabel.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the parent from firing its click event
                        // You could replace this with a more advanced inline display
                        getObtainInfo(comp.item_id, comp.item_name);
                    });
                    compLi.appendChild(itemLabel);

                    // Render the sub-tree if it exists
                    if(comp.obtainment) {
                        compLi.appendChild(renderObtainmentTree(comp.obtainment));
                    }
                    componentsUl.appendChild(compLi);
                });
            }
            li.appendChild(componentsUl);
            ul.appendChild(li);

        } else if (obtainmentData.type === 'drop') {
            obtainmentData.sources.forEach(source => {
                const li = document.createElement('li');
                li.appendChild(createChecklistItem(`Dropped by ${source.npc_name} in ${source.zone_name}`));
                ul.appendChild(li);
            });
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

        const headers = ['name', 'itemtype', 'ac', 'hp', 'mana', 'astr', 'asta', 'adex', 'aagi', 'awis', 'aint', 'acha', 'mr', 'cr', 'fr', 'pr', 'dr'];

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
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => getObtainInfo(item.id, item.name));

            headers.forEach(header => {
                const cell = document.createElement('td');
                cell.textContent = item[header] || '0';
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
