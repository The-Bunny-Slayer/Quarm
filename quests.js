// --- Supabase Client Initialization ---
const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchAndDisplayQuests(zone) {
    const questListContainer = document.getElementById('quest-list-container');
    const zoneTitle = document.getElementById('zone-title');

    if (!zone) {
        zoneTitle.textContent = "No zone specified.";
        return;
    }

    zoneTitle.textContent = `Quests for ${zone}`;
    questListContainer.innerHTML = '<p>Loading quests...</p>';

    try {
        // Fetch only the columns needed for the list view
        const { data, error } = await supabaseClient
            .from('quests')
            .select('name, npc, zone')
            .eq('zone', zone);

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            questListContainer.innerHTML = ''; // Clear loading message
            const ul = document.createElement('ul');
            ul.className = 'quest-list';

            data.forEach(quest => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                // Use the NPC name as a unique identifier for the quest detail page
                a.href = `quest.html?npc=${encodeURIComponent(quest.npc)}`;
                a.textContent = `${quest.name} (NPC: ${quest.npc})`;
                li.appendChild(a);
                ul.appendChild(li);
            });
            questListContainer.appendChild(ul);
        } else {
            questListContainer.innerHTML = `<p>No quests found for ${zone}.</p>`;
        }
    } catch (error) {
        questListContainer.innerHTML = `<p>Error loading quests: ${error.message}</p>`;
        console.error("Error fetching quests:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const zone = params.get('zone');
    fetchAndDisplayQuests(zone);
});
