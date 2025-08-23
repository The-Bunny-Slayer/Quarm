# Instructions for Populating the Quest Database

Here is a step-by-step guide to use the `parse_quest.py` script to process your Lua quest files and upload the structured data into your Supabase project.

---

### Step 1: Create a `quests` Table in Supabase

You need a place to store the structured quest data.

1.  Navigate to your Supabase project dashboard.
2.  Go to the **Table Editor**.
3.  Click on **"New table"**.
4.  Set the table name to **`quests`**.
5.  Add a single column with the following properties:
    *   **Name**: `data`
    *   **Type**: `jsonb`
6.  You can leave the `id` primary key column that Supabase creates by default.
7.  Click **"Save"** to create the table.

Your `quests` table is now ready to receive data.

---

### Step 2: Run the Python Parser Script

The `parse_quest.py` script is designed to read a single Lua quest file and print a structured JSON object to your console.

1.  Make sure you have Python installed on your local machine.
2.  Save the `parse_quest.py` script to your computer.
3.  Open your command line or terminal.
4.  Navigate to the directory where you saved the script.
5.  Run the script on a quest file by passing the file path as an argument.

**Example Command:**
```bash
python parse_quest.py /path/to/your/quests-main/gfaydark/Sarialiyn_Tranquilsong.lua
```

The script will output a single block of JSON text to your terminal.

---

### Step 3: Insert the JSON Data into Supabase

Now, you will take the JSON output and add it as a new row in your `quests` table.

1.  Copy the entire JSON output from your terminal from Step 2.
2.  Go back to the Supabase **Table Editor** and view your `quests` table.
3.  Click on **"Insert"** -> **"Insert row"**.
4.  You will see the `id` and `data` columns. Leave `id` blank (it will be auto-filled).
5.  In the `data` column's input field, **paste the JSON output** you copied.
6.  Click **"Save"** to insert the new quest.

You have now successfully added one quest to your database! You can repeat Steps 2 and 3 for each Lua file to populate your entire quest database.

---

**Tip for Bulk Processing (Optional):**

If you are comfortable with shell scripting, you can automate the process for all files in a directory. For example, on Linux or macOS, you could do something like this to process all files in `gfaydark` and save the output to a single file:

```bash
# Navigate to the directory containing the Lua files
cd /path/to/your/quests-main/gfaydark/

# Run the parser on all .lua files and append the JSON to a single file
for f in *.lua; do \
  echo "Processing $f..." >> quests.json; \
  python /path/to/parse_quest.py "$f" >> quests.json; \
  echo "," >> quests.json; \
done
```
This would give you a single large file (`quests.json`) containing all the JSON objects, which might be easier to work with for a bulk import into Supabase.
