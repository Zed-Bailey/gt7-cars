'use client';

import { SupabaseClient } from "@supabase/supabase-js";
import { ReactNode, useEffect, useState } from "react";
import GetSupabaseClient from "../_helpers/client";
import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";


export default function AppLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {

    const [client, setClient] = useState<SupabaseClient>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        const c = GetSupabaseClient();
        setClient(c);

        const { data } = c.auth.onAuthStateChange((event, session) => {
            console.log(event, session)
          
            if (event === 'INITIAL_SESSION') {
              // handle initial session
              if(session !== null) {
                setIsLoggedIn(true);
              }
            }
            else if (event === 'SIGNED_IN') {
              setIsLoggedIn(true);
            } else if (event === 'SIGNED_OUT') {
              setIsLoggedIn(false);
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

    return (
        <div>
            {
                isLoggedIn ? <LoggedIn logoutClicked={() => client?.auth.signOut()}/> : <NotLoggedIn/>
            }
            
            {children}
        </div>
    );
}


function NotLoggedIn() {
    return (
        <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
         
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="/auth/login">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="/auth/signup" variant="flat">
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    );
}


const LoggedIn = ({ logoutClicked }: {logoutClicked: () => void}) => {
    const currentPath = usePathname();
    
    return(
        <Navbar isBordered>
            <NavbarBrand>
                <p className="font-bold text-inherit">ACME</p>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">

                <NavbarItem isActive={currentPath ===  '/home'}>
                    <Link href="/home" color={currentPath ===  '/home' ? "primary" : "foreground"}>
                        My Vehicles
                    </Link>
                </NavbarItem>

                <NavbarItem isActive={currentPath === '/vehicles'}>
                    <Link href="/vehicles" color={currentPath ===  '/vehicles' ? "primary" : "foreground"} >
                        All Vehicles
                    </Link>
                </NavbarItem>
            
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <Button color="primary" variant="flat" onClick={logoutClicked} >
                    Logout
                    </Button>
                </NavbarItem>
            </NavbarContent>

        </Navbar>
    );
}