const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("script.js loaded");

// --- DATA MAPPINGS ---
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
const ITEM_SKILL_MAP = {
    0: "1H Slashing", 1: "2H Slashing", 2: "1H Piercing", 3: "1H Blunt", 4: "2H Blunt",
    5: "Archery", 7: "Throwing", 35: "2H Piercing", 45: "Hand to Hand"
};
const SIZE_MAP = { 0: "TINY", 1: "SMALL", 2: "MEDIUM", 3: "LARGE", 4: "GIANT", 5: "GIGANTIC" };
const WEAPON_TYPES = Object.keys(ITEM_SKILL_MAP).map(Number);

const SPELL_EFFECT_MAP = {
    0: "Increase Current HP by ${base1} (If Negative, Damage)",
    1: "Increase AC by ${base1}",
    2: "Increase ATK by ${base1}",
    3: "Increase Movement Speed by ${base1}%",
    4: "Increase STR by ${base1}",
    5: "Increase DEX by ${base1}",
    6: "Increase AGI by ${base1}",
    7: "Increase STA by ${base1}",
    8: "Increase INT by ${base1}",
    9: "Increase WIS by ${base1}",
    10: "Increase CHA by ${base1}",
    11: "Increase Attack Speed by ${base1 - 100}%",
    12: "Invisibility (Level ${base1})",
    13: "See Invisibility (Level ${base1})",
    14: "Water Breathing",
    15: "Increase Current Mana by ${base1}",
    18: "Pacify",
    19: "Increase Faction with ${limit} by ${base1}",
    20: "Blind",
    21: "Stun for ${base1} ms (Max Level: ${max})",
    22: "Charm (Max Level: ${max})",
    23: "Fear (Max Level: ${max})",
    24: "Decrease Stamina Loss by ${base1}",
    25: "Bind Affinity",
    26: "Gate",
    27: "Dispel Magic (${base1} power)",
    28: "Invisibility to Undead (Level ${base1})",
    29: "Invisibility to Animals (Level ${base1})",
    30: "Decrease Aggro Radius by ${base1}% (Max Level: ${max})",
    31: "Mesmerize (Max Level: ${max})",
    32: "Summon: ${name}",
    33: "Summon Pet",
    35: "Increase Disease Counter by ${base1}",
    36: "Increase Poison Counter by ${base1}",
    40: "Invulnerability",
    41: "Destroy Target",
    42: "Shadow Step",
    44: "Lycanthropy",
    45: "Vampiric Embrace (${base1}% of melee damage)",
    46: "Increase Fire Resist by ${base1}",
    47: "Increase Cold Resist by ${base1}",
    48: "Increase Poison Resist by ${base1}",
    49: "Increase Disease Resist by ${base1}",
    50: "Increase Magic Resist by ${base1}",
    52: "Sense Undead",
    53: "Sense Summoned",
    54: "Sense Animals",
    55: "Absorb Melee Damage (Rune) for ${base1} total",
    56: "True North",
    57: "Levitate",
    58: "Illusion: ${name}",
    59: "Increase Damage Shield by ${base1}",
    61: "Identify",
    63: "Memory Blur (${base1}% chance)",
    64: "Spin and Stun for ${base1} ms (Max Level: ${max})",
    65: "Infravision",
    66: "Ultravision",
    67: "Eye of Zomm",
    68: "Reclaim Pet",
    69: "Increase Max HP by ${base1}",
    71: "Summon Undead Pet",
    73: "Bind Sight",
    74: "Feign Death (${base1}% success)",
    75: "Voice Graft",
    77: "Locate Corpse",
    78: "Absorb Spell Damage (Rune) for ${base1} total",
    79: "Increase HP by ${base1} (Instant)",
    81: "Resurrect with ${base1}% experience",
    82: "Summon Player",
    83: "Teleport to ${teleport_zone}",
    84: "Gravity Flux (${base1})",
    85: "Add Proc: ${name} with ${limit}% Rate Mod",
    86: "Decrease NPC Reaction Radius by ${base1}",
    87: "Magnify Vision (${base1}%)",
    88: "Evacuate to ${teleport_zone}",
    89: "Increase Player Size by ${base1 - 100}%",
    91: "Summon Corpse (Max Level ${base1})",
    92: "Add ${base1} Hate",
    96: "Silence",
    97: "Increase Max Mana by ${base1}",
    98: "Increase Attack Speed by ${base1 - 100}% (Stacks with Haste)",
    99: "Root",
    100: "Heal Over Time for ${base1}",
    101: "Complete Heal (${base1} base)",
    102: "Fear Immunity",
    103: "Call Pet",
    104: "Translocate to ${teleport_zone}",
    106: "Summon Warder",
    108: "Summon Familiar",
    109: "Summon Item into Bag: ${name}",
    111: "Increase All Resists by ${base1}",
    112: "Increase Effective Casting Level by ${base1}",
    113: "Summon Horse",
    114: "Modify Hate Generation by ${base1}%",
    116: "Increase Curse Counter by ${base1}",
    117: "Make Weapons Magical",
    118: "Increase Singing Amplification by ${base1}%",
    119: "Increase Attack Speed by ${base1 - 100}% (Overhaste)",
    120: "Increase Incoming Heal Effectiveness by ${base1}%",
    121: "Increase Reverse Damage Shield by ${base1}",
    123: "Stacking: Block if ${base1} > -1, No effect if -1",
    124: "Focus: Increase Spell Damage by ${base1}% to ${max}%",
    125: "Focus: Increase Healing by ${base1}% to ${max}%",
    127: "Focus: Increase Spell Haste by ${base1}%",
    128: "Focus: Increase Spell Duration by ${base1}%",
    129: "Focus: Increase Spell Range by ${base1}%",
    130: "Focus: Modify Spell and Bash Hate by ${base1}% to ${max}%",
    131: "Focus: ${base1}% to ${max}% Chance to Not Consume Reagent",
    132: "Focus: Reduce Mana Cost by ${base1}% to ${max}%",
    134: "Focus Limit: Max Level ${base1}",
    135: "Focus Limit: Resist Type ${base1}",
    136: "Focus Limit: Target Type ${base1}",
    137: "Focus Limit: Spell Effect ${base1}",
    138: "Focus Limit: Beneficial Spells Only",
    139: "Focus Limit: Spell ID ${base1}",
    140: "Focus Limit: Min Duration ${base1} ticks",
    141: "Focus Limit: Instant Spells Only",
    142: "Focus Limit: Min Level ${base1}",
    147: "Heal for ${base1}% of Max HP (Max: ${max})",
    148: "Stacking: Block Spell with Effect ${base1}",
    149: "Stacking: Overwrite Spell with Effect ${base1}",
    150: "Death Save with ${base1}% chance",
    151: "Suspend Pet",
    152: "Summon ${base1} Pet(s) for ${max} seconds",
    153: "Balance Group HP, taking ${base1}% damage",
    154: "Dispel Detrimental (${base1}/10 % chance)",
    155: "Increase Spell Critical Damage by ${base1}%",
    156: "Illusion: Target",
    157: "Spell Damage Shield for ${-base1}",
    158: "Reflect Spell with ${base1}% chance",
    159: "Increase All Stats by ${base1}",
    160: "Intoxicate if tolerance is below ${base1}",
    161: "Mitigate ${base1}% of Spell Damage, up to ${max} total",
    162: "Mitigate ${base1}% of Melee Damage, up to ${max} total",
    163: "Absorb ${base1} Spell/Melee Hit(s)",
    167: "Focus: Increase Pet Power by ${base1}",
    168: "Mitigate ${-base1}% of incoming Melee Damage",
    169: "Increase Critical Hit Chance for skill ${limit} by ${base1}%",
    170: "Increase Spell Critical Chance by ${base1}%",
    171: "Increase Crippling Blow Chance by ${base1}%",
    172: "Increase Chance to Avoid Melee by ${base1}%",
    173: "Increase Riposte Chance by ${base1}%",
    174: "Increase Dodge Chance by ${base1}%",
    175: "Increase Parry Chance by ${base1}%",
    176: "Increase Dual Wield Chance by ${base1}%",
    177: "Increase Double Attack Chance by ${base1}%",
    178: "Melee Lifetap for ${base1}% of damage",
    179: "Increase All Instrument Modifiers by ${base1}%",
    180: "Increase Chance to Resist Spells by ${base1}%",
    181: "Increase Chance to Resist Fear by ${base1}%",
    182: "Increase Attack Delay by ${base1}%",
    184: "Increase Chance to Hit by ${base1}% with skill ${limit}",
    185: "Increase Damage by ${base1}% with skill ${limit}",
    186: "Increase Min Damage by ${base1}% with skill ${limit}",
    188: "Increase Block Chance by ${base1}%",
    189: "Increase/Decrease Endurance by ${base1}",
    190: "Increase Max Endurance by ${base1}",
    191: "Amnesia",
    192: "Add ${base1} Hate over time",
    193: "Skill Attack with ${base1} bonus damage",
    194: "Fade (Max Level ${max})",
    195: "Increase Stun Resist by ${base1}%",
    196: "Increase Strikethrough Chance by ${base1}%",
    197: "Modify Damage Taken from skill ${limit} by ${base1}%",
    198: "Increase Endurance by ${base1} (Instant)",
    199: "Taunt with ${base1}% chance and ${limit} hate",
    200: "Increase Weapon Proc Chance by ${base1}%",
    201: "Add Ranged Proc: ${name} with ${limit}% Rate Mod",
    202: "Project Illusion",
    203: "Mass Group Buff",
    205: "AE Rampage",
    206: "AE Taunt for ${base1} hate",
    209: "Dispel Beneficial (${base1}/10 % chance)",
    214: "Increase Max HP by ${base1/100}%",
    216: "Increase Accuracy by ${base1}",
    219: "Slay Undead (${base1}% dmg, ${max/10}% chance)",
    220: "Add ${base1} Damage to skill ${limit}",
    221: "Reduce Inventory Weight by ${base1}%",
    225: "Add ${base1}% chance to Double Attack",
    227: "Reduce Skill Timer by ${base1}s for skill ${limit}",
    228: "Reduce Fall Damage by ${base1}%",
    229: "Increase Chance to Cast While Stunned by ${base1}%",
    232: "Divine Save with ${base1}% chance to cast ${name}",
    254: "Blank",
    262: "Raise Stat Cap of ${limit} by ${base1}",
    266: "Add ${base1}% chance for an extra attack with 2H weapons",
    271: "Increase Base Run Speed by ${base1}%",
    273: "Increase Critical DoT Chance by ${base1}%",
    274: "Increase Critical Heal Chance by ${base1}%",
    275: "Increase Critical Mend Chance by ${base1}%",
    279: "Add ${base1}% chance to Flurry",
    286: "Focus: Add ${base1} to Spell Damage",
    287: "Focus: Increase Spell Duration by ${base1} ticks",
    289: "Cast ${name} when spell fades",
    291: "Purify, removing ${base1} detrimental effect(s)",
    294: "Increase Spell Critical Chance by ${base1}% and Crit Dmg by ${limit}%",
    296: "Focus: Vulnerability to spells, increasing damage taken by ${base1}%",
    297: "Focus: Add ${base1} to incoming spell damage",
    302: "Focus: Increase Spell Damage by ${base1}% (Before Crit)",
    303: "Focus: Add ${base1} to Spell Damage (Before Crit)",
    305: "Mitigate Damage Shield by ${base1}",
    310: "Reduce Reuse Timer of item by ${base1}ms",
    314: "Improved Invisibility (Level ${base1})",
    315: "Improved Invisibility to Undead (Level ${base1})",
    316: "Improved Invisibility to Animals (Level ${base1})",
    317: "Increase HP Regen Cap by ${base1}",
    318: "Increase Mana Regen Cap by ${base1}",
    319: "Increase Critical Heal over Time chance by ${base1}%",
    320: "Increase Shield Block Chance by ${base1}%",
    323: "Add Defensive Proc: ${name} with ${limit}% Rate Mod",
    328: "Increase Negative HP Limit by ${base1}",
    329: "Absorb ${base1}% of damage as Mana",
    330: "Increase Critical Melee Damage by ${base1}% for skill ${limit}",
    337: "Increase Experience Gain by ${base1}%",
    339: "Focus: ${base1}% chance to cast ${name} on spell use",
    340: "Trigger Spell: ${base1}% chance to cast ${name}",
    341: "Increase ATK Cap by ${base1}",
    369: "Increase Corruption Counter by ${base1}",
    370: "Increase Corruption Resist by ${base1}",
    371: "Inhibit Melee, stacks with slow",
    373: "Cast ${name} when spell fades (always)",
    374: "Trigger Spell: ${base1}% chance to cast ${name} (stacks)",
    375: "Increase Critical DoT Damage by ${base1}%",
    382: "Negate Spell Effect: ${limit}",
    383: "Focus: Sympathetic Proc ${name} with ${base1} modifier",
    385: "Focus Limit: Spell Group ${base1}",
    386: "Cast ${name} on Curer",
    387: "Cast ${name} on Cured",
    392: "Focus: Add ${base1} to Healing",
    393: "Focus: Increase Incoming Heal Effectiveness by ${base1}%",
    394: "Focus: Add ${base1} to Incoming Healing",
    396: "Focus: Add ${base1} to Healing (Before Crit)",
    398: "Focus: Increase Swarm Pet Duration by ${base1}ms",
    399: "Focus: ${base1}% chance to Twincast",
    405: "Increase Staff Block Chance by ${base1}%",
    406: "Cast ${name} when hit counter fades",
    413: "Focus: Modify Base Spell Value by ${base1}%",
    416: "Increase AC by ${base1} (v2)",
    417: "Increase Mana Regen by ${base1} (v2)",
    418: "Add ${base1} Damage to skill ${limit} (v2)",
    419: "Add Proc: ${name} with ${limit}% Rate Mod (v2)",
    424: "Gravitate with ${base1} force",
    427: "Add Skill Proc: ${name} with ${limit}% Rate Mod",
    429: "Add Skill Proc on Success: ${name} with ${limit}% Rate Mod",
    439: "Assassinate with ${base1}% chance for ${limit} damage",
    440: "Finishing Blow (Max Level ${base1}, below ${limit/10}% HP)",
    444: "Improved Taunt",
    446: "Stacking: Group A, Value ${base1}",
    447: "Stacking: Group B, Value ${base1}",
    448: "Stacking: Group C, Value ${base1}",
    449: "Stacking: Group D, Value ${base1}",
    450: "Mitigate ${base1}% of DoT Damage, up to ${max} total",
    458: "Modify Faction Gains by ${base1}%",
    459: "Increase Damage by ${base1}% with skill ${limit} (v2)",
    461: "Focus: Increase Spell Damage by ${base1}% to ${max}% (v2)",
    462: "Focus: Add ${base1} to Spell Damage (v2)",
    467: "Mitigate Damage Shield by a flat ${base1}",
    471: "Add ${base1}% chance for a double melee round with ${limit}% damage",
    476: "Weapon Stance: Cast ${name} if weapon type is ${limit}",
    482: "Modify Base Melee Damage by ${base1}% for skill ${limit}",
    488: "Push Taken: ${base1}%",
    489: "Increase Endurance Regen Cap by ${base1}",
    494: "Increase Pet ATK by ${base1}",
    496: "Increase Critical Melee Damage by ${base1}% (No Stack)",
    500: "Focus: Increase Spell Haste by ${base1}% (No Cap)",
    501: "Focus: Reduce Cast Time by ${base1}ms",
    502: "Fearstun for ${base1}ms (Max Level: ${max})",
    507: "Focus: Amplify Spell/Heal/DoT by ${base1}%",
    508: "Focus: Add ${base1} to Spell/Heal/DoT",
    509: "Health Transfer: ${base1/10}% HP for ${limit/10}% damage/heal",
    515: "Increase AC Avoidance by ${base1/100}%",
    516: "Increase AC Mitigation by ${base1/100}%",
    517: "Increase ATK Offense by ${base1/100}%",
    518: "Increase ATK Accuracy by ${base1/100}%",
    519: "Increase Luck by ${base1}",
    522: "Increase Mana by ${base1}% of Max Mana (Max ${max})",
    523: "Increase Endurance by ${base1}% of Max Endurance (Max ${max})",
    524: "Increase HP over time by ${base1}% of Max HP (Max ${max})",
    525: "Increase Mana over time by ${base1}% of Max Mana (Max ${max})",
    526: "Increase Endurance over time by ${base1}% of Max Endurance (Max ${max})"
};

// --- HELPER FUNCTIONS ---
function decodeBitmask(mask, map) {
    const names = [];
    for (const key in map) {
        if (mask & key) {
            names.push(map[key]);
        }
    }
    return [...new Set(names)];
}

function formatCoin(price) {
    if (!price || price <= 0) return 'N/A';
    const plat = Math.floor(price / 1000);
    const gold = Math.floor((price % 1000) / 100);
    const silver = Math.floor((price % 100) / 10);
    const copper = price % 10;
    return `${plat}p ${gold}g ${silver}s ${copper}c`;
}

// --- GLOBAL UI & DATA VARIABLES ---
let tooltip;
let breakdownContainer;
let currentItems = [];
let currentSort = { column: 'name', direction: 'asc' };
let currentView = 'grid';

// --- ASYNC DATA FETCHING ---
async function getObtainInfo(itemId, itemName, itemIcon) {
    breakdownContainer.innerHTML = `<p>Fetching details for ${itemName}...</p>`;
    const { data, error } = await supabaseClient.rpc('get_full_obtainment_details', { p_item_id: itemId, p_visited: [] });
    if (error) {
        console.error(`Error fetching details for ${itemName}:`, error);
        breakdownContainer.innerHTML = `<p>Error fetching details: ${error.message}</p>`;
        return;
    }
    renderBreakdown(data, itemName, itemIcon);
}

async function getSpellDetails(spellId) {
    if (!spellId || spellId <= 0 || spellId === 65535) return null;
    try {
        const spell_columns = ['name', 'teleport_zone'];
        for (let i = 1; i <= 12; i++) {
            spell_columns.push(`effectid${i}`);
            spell_columns.push(`effect_base_value${i}`);
            spell_columns.push(`effect_limit${i}`);
            spell_columns.push(`max${i}`);
        }
        const { data, error } = await supabaseClient.from('spells_new').select(spell_columns.join(',')).eq('id', spellId).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching spell details for ID ${spellId}:`, error);
        return null;
    }
}

async function formatSpellEffect(effectId, base1, limit, max, spell) {
    if (!SPELL_EFFECT_MAP[effectId]) return null;

    let template = SPELL_EFFECT_MAP[effectId];
    let name = spell.name;

    const nameIsAsync = template.includes('${name}') && (
        effectId === 32 || effectId === 109 || // Summon Item
        effectId === 85 || effectId === 201 || effectId === 232 || effectId === 289 ||
        effectId === 323 || effectId === 339 || effectId === 340 || effectId === 373 ||
        effectId === 374 || effectId === 383 || effectId === 386 || effectId === 387 ||
        effectId === 406 || effectId === 419 || effectId === 427 || effectId === 429 ||
        effectId === 476
    );

    if (nameIsAsync) {
        if (effectId === 32 || effectId === 109) { // Summon Item
             const { data: itemData } = await supabaseClient.from('items').select('name').eq('id', base1).single();
             name = itemData ? itemData.name : 'Unknown Item';
        } else { // Procs, triggers etc.
            const { data: procSpell } = await getSpellDetails(base1);
            name = procSpell ? procSpell.name : 'Unknown Spell';
        }
    }

    return template.replace(/\$\{(.*?)\}/g, (match, expr) => {
        try {
            return new Function('base1', 'limit', 'max', 'name', 'teleport_zone', `return ${expr}`)(base1, limit, max, name, spell.teleport_zone);
        } catch (e) {
            return match;
        }
    });
}


// --- UI RENDERING ---
async function showItemTooltip(item, event) {
    tooltip.style.display = 'none';
    let flags = [];
    if (item.magic) flags.push('MAGIC ITEM');
    if (item.loregroup >= 0 && item.loregroup !== null) flags.push('LORE ITEM');
    if (item.nodrop === 0) flags.push('NO DROP');
    if (item.attuneable) flags.push('ATTUNEABLE');

    let html = `<div class="tooltip-title"><img src="https://www.pqdi.cc/static/icons/item_${item.icon}.png" class="tooltip-title-icon" alt="${item.name}"><span>${item.name}</span></div>`;
    if (flags.length > 0) { html += `<div class="tooltip-flags">${flags.join(' ')}</div>`; }

    let slotHtml = '';
    const slots = decodeBitmask(item.slots, SLOT_MAP);
    if (slots.length > 0) slotHtml += `<span class="tooltip-stat-label">Slot:</span><span class="tooltip-stat-value">${slots.join(', ')}</span>`;
    if (item.ac) slotHtml += `<span class="tooltip-stat-label">AC:</span><span class="tooltip-stat-value">${item.ac}</span>`;
    if (WEAPON_TYPES.includes(item.itemtype)) {
        slotHtml += `<span class="tooltip-stat-label">Skill:</span><span class="tooltip-stat-value">${ITEM_SKILL_MAP[item.itemtype] || 'Unknown'}</span>`;
    }
    if (slotHtml) html += `<div class="tooltip-section tooltip-grid-3">${slotHtml}</div>`;

    if (WEAPON_TYPES.includes(item.itemtype)) {
        let weaponHtml = '';
        weaponHtml += `<span class="tooltip-stat-label">DMG:</span><span class="tooltip-stat-value">${item.damage}</span>`;
        weaponHtml += `<span class="tooltip-stat-label">Delay:</span><span class="tooltip-stat-value">${item.delay}</span>`;
        if (item.damage > 0) weaponHtml += `<span class="tooltip-stat-label">Ratio:</span><span class="tooltip-stat-value">${(item.delay / item.damage).toFixed(2)}</span>`;
        html += `<div class="tooltip-section tooltip-grid-3">${weaponHtml}</div>`;
    }

    let statsHtml = '';
    const statPairs = { 'STR': item.astr, 'STA': item.asta, 'DEX': item.adex, 'AGI': item.aagi, 'WIS': item.awis, 'INT': item.aint, 'CHA': item.acha };
    for(const [key, value] of Object.entries(statPairs)) {
        if(value) statsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">${value > 0 ? '+' : ''}${value}</span>`;
    }
    if (item.hp) statsHtml += `<span class="tooltip-stat-label">HP:</span><span class="tooltip-stat-value">+${item.hp}</span>`;
    if (item.mana) statsHtml += `<span class="tooltip-stat-label">MANA:</span><span class="tooltip-stat-value">+${item.mana}</span>`;
    if (statsHtml) html += `<div class="tooltip-section tooltip-grid-3">${statsHtml}</div>`;

    let resistsHtml = '';
    const resistPairs = { 'SV FIRE': item.fr, 'SV DISEASE': item.dr, 'SV COLD': item.cr, 'SV MAGIC': item.mr, 'SV POISON': item.pr };
    for(const [key, value] of Object.entries(resistPairs)) {
        if(value) resistsHtml += `<span class="tooltip-stat-label">${key}:</span><span class="tooltip-stat-value">${value > 0 ? '+' : ''}${value}</span>`;
    }
    if(resistsHtml) html += `<div class="tooltip-section tooltip-grid-3">${resistsHtml}</div>`;

    let effectsHtml = '';
    const effectTypes = { 'Click Effect': item.clickeffect, 'Worn Effect': item.worneffect, 'Proc Effect': item.proceffect, 'Focus Effect': item.focuseffect };
    const effectPromises = Object.entries(effectTypes).map(async ([label, spellId]) => {
        if (!spellId || spellId <= 0 || spellId === 65535) return '';
        const spell = await getSpellDetails(spellId);
        if (!spell || !spell.name) return '';

        let effectHtml = `<div class="tooltip-effect"><span class="tooltip-stat-label">${label}:</span><span class="tooltip-stat-value">${spell.name}</span>`;
        const spellEffectsContainer = document.createElement('div');
        spellEffectsContainer.className = 'tooltip-effect-desc';

        const effectDetailPromises = [];
        for (let i = 1; i <= 12; i++) {
            const effectId = spell[`effectid${i}`];
            if (effectId === 254 || effectId === 0) continue;

            const base1 = spell[`effect_base_value${i}`];
            const limit = spell[`effect_limit${i}`];
            const max = spell[`max${i}`];

            effectDetailPromises.push(formatSpellEffect(effectId, base1, limit, max, spell));
        }

        const resolvedEffects = await Promise.all(effectDetailPromises);
        resolvedEffects.forEach(effectText => {
            if (effectText) {
                const effectLine = document.createElement('div');
                effectLine.textContent = effectText;
                spellEffectsContainer.appendChild(effectLine);
            }
        });

        if (spellEffectsContainer.hasChildNodes()) {
            effectHtml += spellEffectsContainer.outerHTML;
        }
        effectHtml += `</div>`;
        return effectHtml;
    });

    const resolvedEffectsHtml = await Promise.all(effectPromises);
    effectsHtml = resolvedEffectsHtml.join('');

    if (effectsHtml) { html += `<div class="tooltip-section">${effectsHtml}</div>`; }

    let miscHtml = '';
    miscHtml += `<span class="tooltip-stat-label">Weight:</span><span class="tooltip-stat-value">${(item.weight / 10).toFixed(1)}</span>`;
    miscHtml += `<span class="tooltip-stat-label">Size:</span><span class="tooltip-stat-value">${SIZE_MAP[item.size] || 'UNKNOWN'}</span>`;
    if(item.price > 0) miscHtml += `<span class="tooltip-stat-label">Vendor Sell:</span><span class="tooltip-stat-value">${formatCoin(item.price)}</span>`;
    html += `<div class="tooltip-section tooltip-grid-2">${miscHtml}</div>`;

    let restrictionHtml = '';
    if (item.classes === 65535) {
        restrictionHtml += `<span class="tooltip-stat-label">Class:</span><span class="tooltip-stat-value">ALL</span>`;
    } else {
        const classes = decodeBitmask(item.classes, CLASS_MAP);
        if (classes.length > 0) restrictionHtml += `<span class="tooltip-stat-label">Class:</span><span class="tooltip-stat-value">${classes.join(', ')}</span>`;
    }
    if (item.races === 65535) {
        restrictionHtml += `<span class="tooltip-stat-label">Race:</span><span class="tooltip-stat-value">ALL</span>`;
    } else {
        const races = decodeBitmask(item.races, RACE_MAP);
        if (races.length > 0) restrictionHtml += `<span class="tooltip-stat-label">Race:</span><span class="tooltip-stat-value">${races.join(', ')}</span>`;
    }
    if (restrictionHtml) { html += `<div class="tooltip-section">${restrictionHtml}</div>`; }

    if (item.lore) { html += `<div class="tooltip-lore">${item.lore}</div>`; }

    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    if(tooltip) tooltip.style.display = 'none';
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
        const li = document.createElement('li');
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        let craftText = `Craft with ${obtainmentData.tradeskill || 'N/A'} (Trivial: ${obtainmentData.trivial || 'N/A'})`;
        if (obtainmentData.type === 'quest') craftText = `Quest Hand-in to ${obtainmentData.notes || 'N/A'}`;
        summary.textContent = craftText;
        details.appendChild(summary);

        const componentsUl = document.createElement('ul');
        if (obtainmentData.components) {
            obtainmentData.components.forEach(comp => {
                if (!comp.item_data) return;
                const itemData = comp.item_data;
                const compLi = document.createElement('li');
                const label = document.createElement('label');
                label.className = 'checklist-item';
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
                label.appendChild(icon);
                label.appendChild(text);
                compLi.appendChild(label);
                if (comp.obtainment) {
                    compLi.appendChild(renderObtainmentTree(comp.obtainment));
                }
                componentsUl.appendChild(compLi);
            });
        }
        details.appendChild(componentsUl);
        li.appendChild(details);
        ul.appendChild(li);
    } else if (obtainmentData.type === 'obtainment') {
        if (!obtainmentData.sources) {
             const textNode = document.createElement('span');
             textNode.textContent = ' (Ground Spawn or other)';
             textNode.className = 'unknown-source';
             return textNode;
        }
        const sourcesByZone = obtainmentData.sources.reduce((acc, source) => {
            const zone = source.zone || 'Unknown Zone';
            if (!acc[zone]) acc[zone] = [];
            acc[zone].push(source);
            return acc;
        }, {});

        for (const zoneName in sourcesByZone) {
            const li = document.createElement('li');
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.innerHTML = `Obtained in <span class="zone-name">${zoneName}</span>`;
            details.appendChild(summary);

            const npcUl = document.createElement('ul');
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

// --- MAIN SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    tooltip = document.getElementById('tooltip');
    breakdownContainer = document.getElementById('breakdown-container');
    const testButton = document.getElementById('testButton');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const viewToggleButton = document.getElementById('view-toggle-button');

    let currentSort = { column: 'name', direction: 'asc' };

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

            itemDiv.addEventListener('mouseenter', (e) => showItemTooltip(item, e));
            itemDiv.addEventListener('mouseleave', hideTooltip);

            itemDiv.addEventListener('mousemove', (e) => {
                if(tooltip.style.display === 'block'){
                    tooltip.style.left = (e.pageX + 20) + 'px';
                    tooltip.style.top = (e.pageY + 20) + 'px';
                }
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

    drawResults();
});
