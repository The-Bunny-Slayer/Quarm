# Instructions for Populating the Quest Database

Here is a step-by-step guide to use the `parse_quest.py` script to process your Lua quest files and upload the structured data into your Supabase project. This guide uses our recommended "hybrid" table structure for a good balance of query performance and flexibility.

---

### Step 1: Create a `quests` Table with the Hybrid Schema

First, you need to create a table in Supabase with columns that match the parser's output.

1.  Navigate to your Supabase project dashboard and go to the **Table Editor**.
2.  Click on **"New table"**.
3.  Set the table name to **`quests`**.
4.  Remove the default `data` column if it exists.
5.  Add the following columns. The `id` and `created_at` columns can be left as their default values.
    *   `name` (type: `text`)
    *   `zone` (type: `text`)
    *   `npc` (type: `text`)
    *   `rewards` (type: `jsonb`)
    *   `prerequisites` (type: `jsonb`)
    *   `walkthrough` (type: `jsonb`)
    *   `source` (type: `jsonb`)
6.  Click **"Save"** to create the table.

Your `quests` table is now ready to receive the structured data.

---

### Step 2: Run the Python Parser Script

The script will now process your entire quest directory and create multiple, smaller CSV files (one for each zone), which will be placed in an output folder.

1.  Create a directory where you want the final CSV files to be saved (e.g., `quest_csvs`).
2.  Open your command line or terminal.
3.  Run the `parse_quest.py` script, providing two arguments:
    1.  The path to your main quest directory (e.g., `quests-main`).
    2.  The path to the output directory you just created.

**Example Command:**
```bash
python parse_quest.py /path/to/your/quests-main /path/to/your/quest_csvs
```

This command will:
-   Recursively parse all `.lua` files inside `/path/to/your/quests-main`.
-   Create a new `.csv` file for each zone (e.g., `gfaydark.csv`, `freportw.csv`) inside your `quest_csvs` directory.

---

### Step 3: Bulk Import the CSV Files into Supabase

Now, you will upload each of the generated `.csv` files to populate your `quests` table. This process should be much more reliable with the smaller, per-zone files.

1.  Go back to the Supabase **Table Editor** and select your `quests` table.
2.  Click on **"Insert"** -> **"Import data from CSV"**.
3.  Drag and drop one of the new CSV files (e.g., `gfaydark.csv`) into the upload area.
4.  Supabase will parse the file and show you a preview. It should **automatically match the columns** from your CSV file (`name`, `zone`, `npc`, etc.) to the columns in your database table.
5.  Click **"Import"** to begin the bulk upload process.
6.  Repeat this for each of the `.csv` files in your output directory.

Once the imports are complete, your `quests` table will be fully and correctly populated.
