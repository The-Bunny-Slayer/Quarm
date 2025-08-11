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
    const tooltip = document.getElementById('tooltip');

    let currentItems = [];
    let currentSort = { column: 'name', direction: 'asc' };

    // --- Tooltip Functions ---
    function showTooltip(item, event) { /* ... existing code ... */ }
    function hideTooltip() { /* ... existing code ... */ }

    // --- Data Fetching and Rendering for Breakdown ---
    function renderBreakdown(data, itemName) {
        let content = `<h3>Obtainment Info for ${itemName}</h3>`;
        if (data.type === 'craft') {
            content += '<h4>Recipes:</h4>';
            data.recipes.forEach(recipe => {
                content += `<div class="recipe">
                    <p><strong>Recipe:</strong> ${recipe.recipe_name} (Trivial: ${recipe.trivial})</p>
                    <p><strong>Container:</strong> ${recipe.container}</p>
                    <strong>Components:</strong>
                    <ul>
                        ${recipe.components.map(c => `<li>${c.qty} x ${c.name}</li>`).join('')}
                    </ul>
                </div>`;
            });
        } else {
            content += '<p>This item is a drop or a base component. Drop info not yet implemented.</p>';
        }
        breakdownContainer.innerHTML = content;
    }

    async function getObtainInfo(itemId, itemName) {
        breakdownContainer.innerHTML = `<p>Fetching details for ${itemName}...</p>`;

        const { data: recipeEntries, error: recipeError } = await supabaseClient
            .from('tradeskill_recipe_entries')
            .select('recipe_id')
            .eq('item_id', itemId)
            .neq('successcount', 0);

        if (recipeError) {
            breakdownContainer.innerHTML = `<p>Error checking recipes: ${recipeError.message}</p>`;
            return;
        }

        if (recipeEntries && recipeEntries.length > 0) {
            const recipePromises = recipeEntries.map(async (entry) => {
                const recipeId = entry.recipe_id;

                // Get recipe metadata
                const { data: recipeData } = await supabaseClient.from('tradeskill_recipe').select('name,trivial').eq('id', recipeId).single();

                // Get container (manual join)
                const { data: containerEntry } = await supabaseClient.from('tradeskill_recipe_entries').select('item_id').eq('recipe_id', recipeId).eq('iscontainer', 1).single();
                let containerName = 'None';
                if (containerEntry) {
                    const { data: containerItem } = await supabaseClient.from('items').select('name').eq('id', containerEntry.item_id).single();
                    if (containerItem) containerName = containerItem.name;
                }

                // Get components (manual join)
                const { data: componentEntries } = await supabaseClient.from('tradeskill_recipe_entries').select('item_id,componentcount').eq('recipe_id', recipeId).neq('componentcount', 0);
                let components = [];
                if (componentEntries && componentEntries.length > 0) {
                    const componentIds = componentEntries.map(c => c.item_id);
                    const { data: componentItems } = await supabaseClient.from('items').select('id,name').in('id', componentIds);

                    const itemNamesById = componentItems.reduce((acc, item) => {
                        acc[item.id] = item.name;
                        return acc;
                    }, {});

                    components = componentEntries.map(c => ({
                        name: itemNamesById[c.item_id] || 'Unknown Item',
                        qty: c.componentcount
                    }));
                }

                return {
                    recipe_name: recipeData ? recipeData.name : 'Unknown',
                    trivial: recipeData ? recipeData.trivial : 'N/A',
                    container: containerName,
                    components: components
                };
            });
            const recipes = await Promise.all(recipePromises);
            renderBreakdown({ type: 'craft', recipes: recipes }, itemName);
        } else {
            renderBreakdown({ type: 'drop' }, itemName);
        }
    }

    // --- Main Table Rendering ---
    function sortAndRender() { /* ... unchanged ... */ }
    function handleHeaderClick(e) { /* ... unchanged ... */ }
    function drawTable() { /* ... unchanged ... */ }
    function renderNewResults(items) { /* ... unchanged ... */ }

    // --- Initial Data Loaders ---
    async function performSearch(query) { /* ... unchanged ... */ }
    testButton.addEventListener('click', () => { /* ... unchanged ... */ });
    searchButton.addEventListener('click', () => { /* ... unchanged ... */ });

    // Re-paste the unchanged functions here to be safe
    sortAndRender = function() {
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
    handleHeaderClick = function(e) {
        const column = e.target.dataset.column;
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        sortAndRender();
    }
    drawTable = function() {
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
                if (key !== 'id' && item[key] !== null && item[key] !== 0 && item[key] !== -1 && item[key] !== '') {
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
            row.addEventListener('click', () => getObtainInfo(item.id, item.name));
            row.addEventListener('mouseenter', (e) => showTooltip(item, e));
            row.addEventListener('mouseleave', hideTooltip);
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
    renderNewResults = function(items) {
        currentItems = items;
        currentSort = { column: 'name', direction: 'asc' };
        sortAndRender();
    }
    performSearch = async function(query) {
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
