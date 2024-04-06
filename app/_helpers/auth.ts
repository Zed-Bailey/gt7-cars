import GetSupabaseClient from "./client"

export const IsAuthenticated = () => {
    const supabase = GetSupabaseClient();

    return supabase.auth.getSession()
        .then((x) => {
            
            if(!x.data.session) {
                return false;
            }

            return true;
        });
        
}