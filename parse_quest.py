import sys
import json
import re
import os

def parse_quest_file(file_path):
    """
    Parses a given Lua quest file and returns a structured JSON object.
    """
    try:
        with open(file_path, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)

    # --- Parse Zone and NPC from file path ---
    path_parts = file_path.split(os.sep)

    # Zone is the second to last part of the path
    zone = path_parts[-2] if len(path_parts) > 1 else "unknown"

    # NPC name is the filename without extension
    npc_name_raw = os.path.basename(file_path)
    npc_name = os.path.splitext(npc_name_raw)[0].replace('_', ' ')

    quest_name = f"{npc_name}'s Quest"

    quest_data = {
        "quest": {
            "name": quest_name,
            "zone": zone,
            "npc": npc_name,
            "source": {
                "type": "lua",
                "paths": [file_path] # Storing the original path for reference
            },
            "final_rewards": [],
            "prerequisites": [],
            "walkthrough": []
        }
    }

    # --- Parse event_say for dialogue ---
    event_say_match = re.search(r"function event_say\(e\)(.*?)end", content, re.DOTALL)
    if event_say_match:
        event_say_content = event_say_match.group(1)
        dialogue_pattern = re.compile(r'e\.message:findi\("([^"]+)"\)\s*then\s*e\.self:Say\("([^"]+)"\);', re.IGNORECASE)
        dialogues = dialogue_pattern.findall(event_say_content)

        for i, (trigger, response) in enumerate(dialogues):
            # Clean up the response from potential Lua string concatenation
            response = response.replace('" .. e.other:GetCleanName() .. "', ' {player_name}')
            step = f"Step {i+1}: Player says '{trigger}' -> NPC responds: \"{response}\""
            quest_data["quest"]["walkthrough"].append(step)

    # --- Parse Rewards ---
    rewards = []

    # Pattern for SummonCursorItem
    summon_pattern = re.compile(r'e\.other:SummonCursorItem\(([0-9]+)\);', re.IGNORECASE)
    for match in summon_pattern.finditer(content):
        item_id = int(match.group(1))
        rewards.append({
            "type": "item",
            "id": item_id,
            "name": f"Item {item_id}", # Placeholder name
            "pqdi_url": f"https://www.pqdi.cc/item/{item_id}"
        })

    # Pattern for QuestReward
    questreward_pattern = re.compile(r'e\.other:QuestReward\(e\.self,([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+)\);', re.IGNORECASE)
    for match in questreward_pattern.finditer(content):
        cp, sp, gp, pp, item_id, exp = map(int, match.groups())
        if cp > 0 or sp > 0 or gp > 0 or pp > 0:
            rewards.append({
                "type": "coin",
                "pp": pp, "gp": gp, "sp": sp, "cp": cp
            })
        if item_id > 0:
            rewards.append({
                "type": "item",
                "id": item_id,
                "name": f"Item {item_id}", # Placeholder name
                "pqdi_url": f"https://www.pqdi.cc/item/{item_id}"
            })
        if exp > 0:
            rewards.append({
                "type": "exp",
                "amount": str(exp)
            })

    quest_data["quest"]["final_rewards"] = rewards

    # --- Parse event_trade for turn-ins ---
    event_trade_match = re.search(r"function event_trade\(e\)(.*?)end", content, re.DOTALL)
    if event_trade_match:
        event_trade_content = event_trade_match.group(1)
        turn_in_match = re.search(r"item_lib\.check_turn_in\(.*?,\s*\{([^\}]+)\}\)", event_trade_content)
        if turn_in_match:
            turn_in_items_str = turn_in_match.group(1)
            item_ids = re.findall(r'item[0-9]+\s*=\s*([0-9]+)', turn_in_items_str)

            # Count item quantities
            item_counts = {}
            for item_id in item_ids:
                item_counts[item_id] = item_counts.get(item_id, 0) + 1

            # Format the turn-in step
            turn_in_parts = []
            for item_id, count in item_counts.items():
                turn_in_parts.append(f"{count}x Item {item_id}")

            turn_in_step = f"Hand in: {', '.join(turn_in_parts)}."
            quest_data["quest"]["walkthrough"].append(turn_in_step)

    return quest_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_quest.py <path_to_lua_file>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    parsed_data = parse_quest_file(file_path)

    # Pretty-print the JSON output
    print(json.dumps(parsed_data, indent=2))
