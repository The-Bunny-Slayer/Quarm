const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("script.js loaded");
console.log("Supabase client initialized:", supabaseClient);

document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');

    function renderResults(items) {
        resultsContainer.innerHTML = ''; // Clear previous results

        if (!items || items.length === 0) {
            resultsContainer.innerHTML = '<p>No items found.</p>';
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item'; // Add a class for styling

            const itemDetails = document.createElement('dl');

            for (const key in item) {
                if (key !== 'id') { // Exclude the 'id' field
                    const dt = document.createElement('dt');
                    dt.textContent = key;
                    itemDetails.appendChild(dt);

                    const dd = document.createElement('dd');
                    dd.textContent = item[key];
                    itemDetails.appendChild(dd);
                }
            }
            itemDiv.appendChild(itemDetails);
            resultsContainer.appendChild(itemDiv);
        });
    }

    // Event listener for the "Fetch All Data" button
    testButton.addEventListener('click', async () => {
        resultsContainer.innerHTML = '<p>Fetching all data...</p>';

        const { data, error } = await supabaseClient
            .from('items')
            .select('*');

        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            console.error('Error fetching data:', error);
        } else {
            renderResults(data);
        }
    });

    // Event listener for the "Search" button
    searchButton.addEventListener('click', async () => {
        const searchTerm = searchInput.value;
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        resultsContainer.innerHTML = `<p>Searching for "${searchTerm}"...</p>`;

        const { data, error } = await supabaseClient
            .from('items')
            .select('*')
            .ilike('name', `%${searchTerm}%`);

        if (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            console.error('Error searching data:', error);
        } else {
            renderResults(data);
        }
    });
});
