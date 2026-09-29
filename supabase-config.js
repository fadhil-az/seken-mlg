const SUPABASE_URL = "https://uktcmmkynnhpecatjufz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_baxfqpto6qzG5Fh3GcuD9Q_Dcuj4Z1p";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
