const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };

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
        if (!currentItems || currentItems.length === 0) {
            return;
        }

        const table = document.createElement('table');
        table.className = 'results-table';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        const headerSet = new Set();
        currentItems.forEach(item => {
            Object.keys(item).forEach(key => {
                const value = item[key];
                if (key !== 'id' && value !== null && value !== 0 && value !== -1 && value !== '') {
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
        currentSort = { column: 'name', direction: 'asc' }; // Default sort by name
        sortAndRender();
    }

    testButton.addEventListener('click', async () => {
        resultsContainer.innerHTML = '<p>Fetching all data...</p>';
        const { data, error } = await supabaseClient.from('items').select('*');
        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
            renderNewResults(data);
        }
    });

    searchButton.addEventListener('click', async () => {
        const searchTerm = searchInput.value;
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }
        resultsContainer.innerHTML = `<p>Searching for "${searchTerm}"...</p>`;
        const { data, error } = await supabaseClient.from('items').select('*').ilike('name', `%${searchTerm}%`);
        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
            renderNewResults(data);
        }
    });
});
