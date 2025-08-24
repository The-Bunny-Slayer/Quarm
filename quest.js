// --- Supabase Client Initialization ---
const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Main ---
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const npcName = params.get('npc');
    fetchAndRenderQuest(npcName);
});

async function fetchAndRenderQuest(npcName) {
    const container = document.getElementById('quest-container');
    if (!container) return;

    if (!npcName) {
        container.innerHTML = '<h1>No quest NPC specified.</h1><p>Please select a quest from the quest list.</p>';
        return;
    }

    container.innerHTML = '<h1>Loading quest...</h1>';

    try {
        const { data, error } = await supabaseClient
            .from('quests')
            .select('*')
            .eq('npc', npcName)
            .single();

        if (error) throw error;

        if (data) {
            // The data from Supabase has JSON strings in some columns, we need to parse them.
            const questData = {
                ...data,
                rewards: JSON.parse(data.rewards),
                prerequisites: JSON.parse(data.prerequisites),
                walkthrough: JSON.parse(data.walkthrough),
                source: JSON.parse(data.source)
            };
            renderQuest(container, questData);
        } else {
            container.innerHTML = `<h1>Quest not found for NPC: ${npcName}</h1>`;
        }
    } catch (error) {
        container.innerHTML = `<h1>Error loading quest</h1><p>${error.message}</p>`;
        console.error("Error fetching quest:", error);
    }
}

function renderQuest(container, questData) {
    container.innerHTML = ''; // Clear loading message

    const title = document.createElement('h2');
    title.innerHTML = `${questData.name} (Zone: <i>${questData.zone}</i>) – NPC: <i>${questData.npc}</i>`;
    container.appendChild(title);

    // Render sections
    renderRewards(container, questData.rewards);
    renderWalkthrough(container, questData.walkthrough);
    renderNotes(container, questData.prerequisites);
    renderSources(container, questData);
}

// --- Section Renderers ---

function createSection(title) {
    const section = document.createElement('div');
    section.className = 'quest-section';
    const header = document.createElement('h3');
    header.textContent = title;
    section.appendChild(header);
    return section;
}

function renderRewards(container, rewards) {
    if (!rewards || rewards.length === 0) return;
    const section = createSection('Final Reward(s)');
    const list = document.createElement('ul');

    rewards.forEach(reward => {
        const li = document.createElement('li');
        if (reward.type === 'item') {
            li.innerHTML = `<a href="${reward.pqdi_url}" target="_blank">${reward.name}</a>`;
        } else if (reward.type === 'coin') {
            li.textContent = `${reward.gp} Gold, ${reward.sp} Silver, ${reward.cp} Copper`;
        } else if (reward.type === 'exp') {
            li.textContent = `${reward.amount} XP`;
        } else if (reward.type === 'faction') {
            const adjustments = reward.adjustments.map(adj => `Faction ${adj.faction_id} ${adj.delta > 0 ? '+' : ''}${adj.delta}`).join(', ');
            li.textContent = `Faction: ${adjustments}`;
        }
        list.appendChild(li);
    });

    section.appendChild(list);
    container.appendChild(section);
}

function renderWalkthrough(container, walkthrough) {
    if (!walkthrough || walkthrough.length === 0) return;
    const section = createSection('Step-by-Step Walkthrough');
    const list = document.createElement('ol');
    walkthrough.forEach(stepText => {
        const li = document.createElement('li');
        li.innerHTML = stepText; // Using innerHTML to render potential bold/italic tags from parser
        list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
}

function renderNotes(container, prerequisites) {
    if (!prerequisites || prerequisites.length === 0) return;
    const section = createSection('Notes & Edge Cases');
    const list = document.createElement('ul');
    prerequisites.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
}

function renderSources(container, questData) {
    if (!questData.source) return;
    const section = createSection('Sources');
    const list = document.createElement('ul');

    if (questData.source.path) {
        const li = document.createElement('li');
        const path = questData.source.path;
        // Assuming the path is something like '.../zone/npc.lua'
        li.innerHTML = `Lua script: ${path.split(/\/|\\/).slice(-2).join('/')}`;
        list.appendChild(li);
    }

    const itemRewards = (questData.rewards || []).filter(r => r.type === 'item');
    if (itemRewards.length > 0) {
        const li = document.createElement('li');
        li.textContent = 'PQDI entries:';
        const subList = document.createElement('ul');
        itemRewards.forEach(item => {
            const itemLi = document.createElement('li');
            itemLi.innerHTML = `<a href="${item.pqdi_url}" target="_blank">${item.name}</a>: item ${item.id}`;
            subList.appendChild(itemLi);
        });
        li.appendChild(subList);
        list.appendChild(li);
    }

    section.appendChild(list);
    container.appendChild(section);
}
