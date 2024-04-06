import { NextRequest, NextResponse } from "next/server";


import { IsAuthenticated } from "./app/_helpers/auth";

const protectedRoutes = [
    "/home",
    "/vehicles"
];


export default async function middleware(req: NextRequest) {
    
    // const auth = await IsAuthenticated();
    // console.log(auth);
    // if (!auth && protectedRoutes.includes(req.nextUrl.pathname)) {
    //   const absoluteURL = new URL("/auth/login", req.url);
    //   return NextResponse.redirect(absoluteURL);
    // }

    // return NextResponse.next();
  }