'use client';

import { Button, Input } from "@nextui-org/react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GetSupabaseClient from "@/app/_helpers/client";

export default function Login({props}) { 

    const [error, setError] = useState(null);
    const {push} = useRouter();

    async function submit(event) {
        event.preventDefault();
        let email = event.target.email.value;
        let pwd = event.target.password.value;
        console.log(email, pwd);

        const supabase = GetSupabaseClient();
                
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pwd,
        })

        if(error) {
            setError(error.message);
            return;
        }

        console.log(data);
        push('/home');
    }



    return (
        <main className="flex w-full justify-center items-center">
            <form className="w-full max-w-96 my-auto" onSubmit={submit}>
                <h1 className="text-2xl mb-5">Login</h1>
                
                <Input name="email" type="email" variant="bordered" label="Email" className="mb-5" isRequired/>
                <Input name="password" type="password" variant="bordered" label="Password" isRequired/>
                
                <p><span className="text-sm text-red-400">
                    {error ?? ""}
                </span>
                </p>
                <p className="text-sm text-gray-300">Don't have an account? <a className="underline text-blue-500" href="/auth/signup">Sign up</a></p>

                <Button type="submit" variant="flat" color="primary" className="w-full mt-5">Login</Button>
            </form>
        </main>
    );
}