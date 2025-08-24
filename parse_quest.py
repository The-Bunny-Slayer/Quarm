import sys
import json
import re
import os
import csv

def read_file_safely(file_path):
    """
    Reads a file and automatically handles encoding issues.
    Tries UTF-8 first, then falls back to CP1252 if needed.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="cp1252", errors="replace") as f:
            return f.read()

def parse_quest_file(file_path):
    """
    Parses a given Lua quest file and returns a dictionary of quest data.
    """
    content = read_file_safely(file_path)

    # --- Parse Zone and NPC from file path ---
    path_parts = file_path.split(os.sep)
    zone = path_parts[-2] if len(path_parts) > 1 else "unknown"
    npc_name_raw = os.path.basename(file_path)
    npc_name = os.path.splitext(npc_name_raw)[0].replace('_', ' ')
    quest_name = f"{npc_name}'s Quest"

    # --- Initialize data structures ---
    walkthrough = []
    rewards = []
    prerequisites = [] # Placeholder for future implementation

    # --- Parse event_say for dialogue ---
    event_say_match = re.search(r"function event_say\(e\)(.*?)end", content, re.DOTALL)
    if event_say_match:
        event_say_content = event_say_match.group(1)
        dialogue_pattern = re.compile(r'e\.message:findi\("([^"]+)"\)\s*then\s*e\.self:Say\("([^"]+)"\);', re.IGNORECASE)
        for i, (trigger, response) in enumerate(dialogue_pattern.findall(event_say_content)):
            response = response.replace('" .. e.other:GetCleanName() .. "', ' {player_name}')
            walkthrough.append(f"Player says '{trigger}' -> NPC responds: \"{response}\"")

    # --- Parse Rewards ---
    summon_pattern = re.compile(r'e\.other:SummonCursorItem\(([0-9]+)\);', re.IGNORECASE)
    for match in summon_pattern.finditer(content):
        item_id = int(match.group(1))
        rewards.append({"type": "item", "id": item_id, "name": f"Item {item_id}", "pqdi_url": f"https://www.pqdi.cc/item/{item_id}"})

    questreward_pattern = re.compile(r'e\.other:QuestReward\(e\.self,([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+)\);', re.IGNORECASE)
    for match in questreward_pattern.finditer(content):
        cp, sp, gp, pp, item_id, exp = map(int, match.groups())
        if any([cp > 0, sp > 0, gp > 0, pp > 0]):
            rewards.append({"type": "coin", "pp": pp, "gp": gp, "sp": sp, "cp": cp})
        if item_id > 0:
            rewards.append({"type": "item", "id": item_id, "name": f"Item {item_id}", "pqdi_url": f"https://www.pqdi.cc/item/{item_id}"})
        if exp > 0:
            rewards.append({"type": "exp", "amount": str(exp)})

    # --- Parse event_trade for turn-ins ---
    event_trade_match = re.search(r"function event_trade\(e\)(.*?)end", content, re.DOTALL)
    if event_trade_match:
        event_trade_content = event_trade_match.group(1)
        turn_in_match = re.search(r"item_lib\.check_turn_in\(.*?,\s*\{([^\}]+)\}\)", event_trade_content)
        if turn_in_match:
            turn_in_items_str = turn_in_match.group(1)
            item_ids = re.findall(r'item[0-9]+\s*=\s*([0-9]+)', turn_in_items_str)
            item_counts = {}
            for item_id in item_ids:
                item_counts[item_id] = item_counts.get(item_id, 0) + 1
            turn_in_parts = [f"{count}x Item {item_id}" for item_id, count in item_counts.items()]
            walkthrough.append(f"Hand in: {', '.join(turn_in_parts)}.")

    # --- Assemble final quest object ---
    quest_data = {
        "name": quest_name,
        "zone": zone,
        "npc": npc_name,
        "rewards": rewards,
        "prerequisites": prerequisites,
        "walkthrough": walkthrough,
        "source": {"type": "lua", "path": file_path}
    }
    return quest_data

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python parse_quest.py <path_to_quests_directory> <output_directory>", file=sys.stderr)
        sys.exit(1)

    root_dir = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.isdir(root_dir):
        print(f"Error: Provided path '{root_dir}' is not a directory.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    quests_by_zone = {}
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".lua"):
                file_path = os.path.join(subdir, file)
                print(f"Parsing {file_path}...", file=sys.stderr)
                parsed_data = parse_quest_file(file_path)
                zone = parsed_data['zone']
                if zone not in quests_by_zone:
                    quests_by_zone[zone] = []
                quests_by_zone[zone].append(parsed_data)

    print(f"\nFound {len(quests_by_zone)} zones. Writing CSV files to '{output_dir}'...", file=sys.stderr)

    # --- Write one CSV file per zone ---
    for zone, quests in quests_by_zone.items():
        output_filename = os.path.join(output_dir, f"{zone}.csv")
        with open(output_filename, 'w', newline='', encoding='utf-8') as f:
            header = ['name', 'zone', 'npc', 'rewards', 'prerequisites', 'walkthrough', 'source']
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            for quest in quests:
                # Convert list/dict fields to JSON strings for CSV
                quest['rewards'] = json.dumps(quest['rewards'])
                quest['prerequisites'] = json.dumps(quest['prerequisites'])
                quest['walkthrough'] = json.dumps(quest['walkthrough'])
                quest['source'] = json.dumps(quest['source'])
                writer.writerow(quest)
        print(f"  - Wrote {len(quests)} quests to {output_filename}", file=sys.stderr)

    print("\nProcessing complete.", file=sys.stderr)
