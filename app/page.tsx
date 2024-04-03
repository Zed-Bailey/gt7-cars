"use client";

import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import {MailIcon} from "./_icons/Mailicon";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const {push} = useRouter();

  const submitSubscription = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    push('/subscription');
  }


  return (
      <main className="flex flex-col py-10 items-center">

        <section className="self-center">
          
          <div className="flex gap-3">
            <div className="w-72 h-56 bg-gray-200"></div>
            
            <div>
              <h1 className="text-3xl font-bold">Gran Turismo 7 legend cars notifier</h1>
              <p>Get notified when a legend car comes into the dealership</p>
            </div>
            
          </div>
          

        </section>
        

        <section className="w-full">
          <h2>Login or Sign up</h2>
          <Button color="primary" onClick={() => push('/auth/login')}>Login</Button>
          <Button  variant="ghost" onClick={() => push('/auth/signup')}>Sign up</Button>
        </section>
        
      </main>
  );
}
