import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type AuthenticatedUser = {
    user_id: string | null,
    setUserId: (value: string | null) => void
}

export const AuthenticatedUserContext = createContext<AuthenticatedUser>({
    user_id: null, // default userID is null
    setUserId: () => {}
});

export const useAuthenticatedUserContext = () => useContext(AuthenticatedUserContext);