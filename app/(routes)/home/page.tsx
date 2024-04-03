'use client';

import GetSupabaseClient from "@/app/_helpers/client";
import { select } from "@nextui-org/react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function Home() {


    const [supabase, setSupabase] = useState<SupabaseClient>();

    useEffect(() => {
        const client = GetSupabaseClient();
        setSupabase(client);
        
        async function get() {
            const uid = (await client.auth.getSession()).data.session?.user.id;
            if(!uid) {
                console.log("ERROR: no user id");
            }

            const {data, error} = await client
                .from('UserSubscriptions')
                .select()
                .eq('user_id', uid);

            if(error) {
                console.log(error);
            }

            console.log("data", data);
            
        }

        get();

    }, []);



    return (
        <div>Hello world</div>
    );
}