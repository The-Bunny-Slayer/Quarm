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

### Step 2: Run the Python Parser Script on a Directory

The `parse_quest.py` script is designed to read a directory, find all `.lua` files within it and its subdirectories, and create a single JSON file containing all the parsed quest data.

1.  Make sure you have Python installed on your local machine.
2.  Save the `parse_quest.py` script to your computer.
3.  Open your command line or terminal.
4.  Run the script, passing the path to your main quest directory (e.g., `quests-main`) as an argument. It's recommended to redirect the output to a file.

**Example Command:**
```bash
python parse_quest.py /path/to/your/quests-main > all_quests.json
```

This command will:
-   Recursively parse all `.lua` files inside `/path/to/your/quests-main`.
-   Create a new file named `all_quests.json` containing a single JSON array of all your parsed quest data.

---

### Step 3: Bulk Import the JSON Data into Supabase

Now, you will upload the `all_quests.json` file to populate your `quests` table.

1.  Go back to the Supabase **Table Editor** and select your `quests` table.
2.  Click on **"Insert"** -> **"Import data from CSV"**. (Note: This tool also accepts JSON arrays).
3.  Drag and drop your `all_quests.json` file into the upload area.
4.  Supabase will parse the file and show you a preview. It should correctly identify the `data` column. If it asks you to select a column, choose the `data` column.
5.  Click **"Import"** to begin the bulk upload process.

Once the import is complete, your `quests` table will be fully populated with all the parsed quest data.
