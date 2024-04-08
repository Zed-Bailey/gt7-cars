import GetSupabaseClient from "./client"

export const IsAuthenticated = () => {
    let supabase = GetSupabaseClient();

    return supabase.auth.getSession()
        .then((x) => {
            const { data: { session }, } = x;
            console.log(session);

            if(!x.data.session) {
                return false;
            }

            return true;
        });
        
}