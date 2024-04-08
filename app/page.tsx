"use client";

import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { push } = useRouter();

  const submitSubscription = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    push('/subscription');
  }


  return (
    <main className="flex flex-col  items-center bg-cover bg-fixed bg-center bg-no-repeat"
      style={{ backgroundImage: `url("787b.jpg")` }} >

      {/* <img className="w-full h-80 object-cover bg-fixed" src="787b.jpg"/> */}

      <div className="mt-40 bg-black w-full">
        <h1 className="text-center font-bold text-3xl mt-10">Gran Turismo 7 Dealership Notifier</h1>

        <div className="flex flex-col w-full items-center">

          {/* Legendary */}
          <section className="flex gap-10 mt-20">

            <div className="w-96 h-64 bg-gray-400"></div>

            <div className="w-96">
              <h2 className="text-2xl mb-3">Legend Cars</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur. Vitae auctor feugiat facilisis odio nec condimentum. Varius felis potenti in nibh tincidunt scelerisque sed urna eget.
              </p>
            </div>

          </section>

          {/* Used */}
          <section className="flex gap-10  mt-20">


            <div className="w-96">
              <h2 className="text-2xl mb-3">Used Cars</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur. Vitae auctor feugiat facilisis odio nec condimentum. Varius felis potenti in nibh tincidunt scelerisque sed urna eget.
              </p>
            </div>

            <div className="w-96 h-64 bg-gray-400"></div>
          </section>




          <section className="flex flex-col w-96 text-center mt-20 gap-4">
            <h2 className="text-2xl">Get Started Now</h2>
            <Button color="primary" onClick={() => push('/auth/login')}>Login</Button>
            <Button variant="ghost" onClick={() => push('/auth/signup')}>Sign up</Button>
          </section>

        </div>

        <div className="px-10 py-4 text-gray-600 ">
          <span>Built by <a className="underline" href="https://github.com/Zed-Bailey">Zed</a></span>
        </div>


      </div>

    </main>
  );
}
