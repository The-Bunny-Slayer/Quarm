const mockQuestData = {
    "quest": {
        "name": "A Hero’s Solace",
        "zone": "gfaydark",
        "npc": "Kiela Nightshade",
        "source": {
            "type": "lua",
            "paths": ["https://github.com/SecretsOTheP/quests/gfaydark/Kiela_Nightshade.lua"]
        },
        "final_rewards": [
            { "type": "item", "id": 50021, "name": "Amulet of Twilight", "pqdi_url": "https://www.pqdi.cc/item/50021" },
            { "type": "coin", "pp": 0, "gp": 12, "sp": 15, "cp": 0 },
            { "type": "exp", "amount": "1500" },
            { "type": "faction", "adjustments": [{ "faction_id": 42, "delta": 10 }, { "faction_id": 79, "delta": -5 }] }
        ],
        "prerequisites": [
            "Minimum level: 10",
            "Must have completed 'Moonlit Aid' quest"
        ]
    }
};

// --- Main ---
document.addEventListener('DOMContentLoaded', () => {
    const questContainer = document.getElementById('quest-container');
    if (questContainer) {
        renderQuest(questContainer, mockQuestData.quest);
    }
});

function renderQuest(container, questData) {
    container.innerHTML = ''; // Clear any previous content

    // Create and append the main title
    const title = document.createElement('h2');
    title.innerHTML = `${questData.name} (Zone: <i>${questData.zone}</i>) – NPC: <i>${questData.npc}</i>`;
    container.appendChild(title);

    // Render sections
    renderRewards(container, questData.final_rewards);
    renderWalkthrough(container); // Hardcoded for now
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
    const section = createSection('Final Reward(s)');
    const list = document.createElement('ul');

    rewards.forEach(reward => {
        const li = document.createElement('li');
        if (reward.type === 'item') {
            // Note: icon is missing from mock data, so we can't display it yet.
            li.innerHTML = `<a href="${reward.pqdi_url}" target="_blank">${reward.name}</a>`;
        } else if (reward.type === 'coin') {
            li.textContent = `${reward.gp} Gold, ${reward.sp} Silver`;
        } else if (reward.type === 'exp') {
            li.textContent = `${reward.amount} XP`;
        } else if (reward.type === 'faction') {
            // Note: faction IDs need to be resolved to names. For now, showing raw data.
            const adjustments = reward.adjustments.map(adj =>
                `Faction ${adj.faction_id} ${adj.delta > 0 ? '+' : ''}${adj.delta}`
            ).join(', ');
            li.textContent = `Faction: ${adjustments}`;
        }
        list.appendChild(li);
    });

    section.appendChild(list);
    container.appendChild(section);
}

function renderWalkthrough(container) {
    const section = createSection('Step-by-Step Walkthrough');

    // NOTE: This data is hardcoded from the user's example,
    // as it was not present in the provided JSON data structure.
    const steps = [
        'Talk to <strong>Kiela Nightshade</strong> in the Forest of Lament and say “I seek solace”.',
        'Kiela says: “The forest weeps for heroes. Will you answer its call?”',
        'If you respond “Yes, I will help”, she says: “Bring me 3 × Shimmering Bark (ID 60045) and 1 × Moonlight Dew (ID 60046).”',
        'Return with 3 × Shimmering Bark and 1 × Moonlight Dew to Kiela.',
        'Upon successful hand-in, she gives you the Amulet of Twilight, 12 gp 15 sp, 1,500 XP, and faction adjustments.',
        'Dialogue: “You are a true forest champion. Wear this amulet as proof of your bond.”'
    ];

    const list = document.createElement('ol');
    steps.forEach(stepText => {
        const li = document.createElement('li');
        li.innerHTML = stepText;
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
    const section = createSection('Sources');
    const list = document.createElement('ul');

    // Source Lua file
    if (questData.source && questData.source.paths && questData.source.paths.length > 0) {
        const li = document.createElement('li');
        const path = questData.source.paths[0];
        li.innerHTML = `Lua script: <a href="${path}" target="_blank">${path.split('/').slice(-2).join('/')}</a>`;
        list.appendChild(li);
    }

    // PQDI item entries
    const itemRewards = questData.final_rewards.filter(r => r.type === 'item');
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
