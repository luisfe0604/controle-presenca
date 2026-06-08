import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ngfuquqknytsohukhqvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_snJn6imNMNwWX2C-__KqMw_lyYwJYRc";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);