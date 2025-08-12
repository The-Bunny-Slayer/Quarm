const SUPABASE_URL = "https://ixxfjgqhekdrpruxmtkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-OSudPLAgltcZ4ZdjWZvbw_ezCRZPnM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const dataContainer = document.getElementById('data-container');

    try {
        const { data, error } = await supabaseClient
            .from('items')
            .select('*');

        if (error) {
            throw error;
        }

        dataContainer.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        dataContainer.textContent = `Error fetching data: ${error.message}`;
        console.error('Error fetching item data:', error);
    }
});
