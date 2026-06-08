const SUPABASE_URL = "https://ngfuquqknytsohukhqvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_snJn6imNMNwWX2C-__KqMw_lyYwJYRc";

if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
}

const supaBase = window.supabaseClient;
