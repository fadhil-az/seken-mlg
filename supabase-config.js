const SUPABASE_URL = "https://uktcmmkynnhpecatjufz.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_baxfqpto6qzG5Fh3GcuD9Q_Dcuj4Z1p";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
