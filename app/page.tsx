"use client";

import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import {MailIcon} from "./icons/Mailicon";
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
          <h2 className="text-2xl">Create or update your subscription</h2>

          <form className="w-full sm:max-w-96" onSubmit={submitSubscription}>
            
            <Input
              required
              variant="flat"
              type="email"
              label="Email"
              placeholder="you@example.com"
              startContent={
                <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
              }
            />

            <Button type="submit" color="primary">
              Submit
            </Button>
          </form>
          
        </section>
        
      </main>
  );
}
