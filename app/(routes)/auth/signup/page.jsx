'use client';

import { Button, Input } from "@nextui-org/react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Singup() {

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const {push} = useRouter();


    async function submit(event) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        let email = event.target.email.value;
        let pwd = event.target.password.value;
        let pwdConfirm = event.target.confirm.value;

        if(pwd !== pwdConfirm) {
            setError("Passwords don't match");
            return;
        }


        console.log(email, pwd);

        const supabase = GetSupabaseClient();
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: pwd,
        })

        if(error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        push('/home');


    }



    return (
        <main className="flex w-full justify-center items-center">
            <form className="w-full max-w-96 my-auto" onSubmit={submit}>
                <h1 className="text-2xl mb-5">Sign up</h1>
                
                <Input name="email" type="email" variant="bordered" label="Email" className="mb-5" isRequired/>

                <Input name="password" type="password" variant="bordered" label="Password" isRequired className="mb-2"/>
                <Input name="confirm" type="password" variant="bordered" label="Confirm password" isRequired/>

                <p className="text-red-500 text-sm">
                    {error ?? ""}
                </p>
                <p className="text-sm text-gray-300">Already have an account? <a className="underline text-blue-500" href="/auth/login">Login</a></p>


                <Button type="submit" variant="flat" color="primary" className="w-full mt-5" isLoading={loading}>Sign up</Button>
            </form>
        </main>
    );
}