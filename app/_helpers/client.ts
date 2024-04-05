import { SupabaseClient, createClient } from "@supabase/supabase-js";


export default function GetSupabaseClient() : SupabaseClient {
    return createClient(process.env.supabaseUrl ?? "", process.env.supabaseKey ?? "");

}