'use client';

import { SupabaseClient } from "@supabase/supabase-js";
import { ReactNode, useEffect, useState } from "react";
import GetSupabaseClient from "../_helpers/client";
import { usePathname, useRouter } from "next/navigation";
import { AuthenticatedUser, AuthenticatedUserContext } from "../_helpers/authContext";
import { useAuthenticatedUserContext } from "../_helpers/authContext";
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";

import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';

import {Button} from 'primereact/button';

export default function AppLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {

    const [client, setClient] = useState<SupabaseClient>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const {user_id, setUserId} = useAuthenticatedUserContext();

    useEffect(() => {
        const c = GetSupabaseClient();
        setClient(c);

        const { data } = c.auth.onAuthStateChange((event, session) => {
            console.log(event, session)
          
            if (event === 'INITIAL_SESSION') {
              // handle initial session
              if(session !== null) {
                setIsLoggedIn(true);
                setUserId(session.user.id);
                Cookies.set('auth', 'true', {sameSite : "Strict"});
              }
            }
            else if (event === 'SIGNED_IN') {
              setIsLoggedIn(true);
              if(session) {
                setUserId(session.user.id);
                let l=Cookies.set('auth', 'true', {sameSite : "Strict"});
                console.log('cookie: ', l)
              }
            } else if (event === 'SIGNED_OUT') {
              setIsLoggedIn(false);
              setUserId(null);
              Cookies.remove("auth");
            }
            else if (event === 'PASSWORD_RECOVERY') {
              // handle password recovery event
            } else if (event === 'TOKEN_REFRESHED') {
              // handle token refreshed event
            } else if (event === 'USER_UPDATED') {
              // handle user updated event
            }

          })
          

          // call unsubscribe to remove the callback on component dismount
          return () => data.subscription.unsubscribe()
    }, []);

    const { push } = useRouter();


    const loggedInMenuItems: MenuItem[] = [
      {
        label: "Garage",
        icon: "pi pi-home",
        url: "/home"
      },
      {
        label: "All Vehicles",
        icon: "pi pi-home",
        url: "/vehicles"
      }
    ]

    const end = (
      isLoggedIn ? <div>
        <Button label="Logout" outlined severity="success" 
          onClick={() => {
            client?.auth.signOut();
            push('/');
            }}
        />

      </div> 
      : <div className="flex gap-2">
        <a href="/auth/login" className="p-button font-bold text-white">
            Login
        </a>
        <a href="/auth/signup" className="p-button font-bold text-white">
            Sign Up
        </a>
      </div>
    );


    const start = (
      <div>
        <h1 className="font-semibold text-slate-700">GT-7 Car Notifier</h1>
      </div>
    );

    return (
      <AuthenticatedUserContext.Provider value={{user_id, setUserId}}>
          <div>

            <Menubar model={isLoggedIn ? loggedInMenuItems : []} end={end} start={start} className="sticky top-0 left-0 z-50"/> 

            {children}

            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="dark"
                transition={Bounce}
              />

          </div>
      </AuthenticatedUserContext.Provider>
    );
}