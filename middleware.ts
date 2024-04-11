import { NextRequest, NextResponse } from "next/server";
import { IsAuthenticated } from "./app/_helpers/auth";
import { useAuthenticatedUserContext } from "./app/_helpers/authContext";
import Cookies from "js-cookie";

const protectedRoutes = [
    "/home",
    "/vehicles"
];


export default function middleware(req: NextRequest) {

    let isAuth = req.cookies.get("auth")?.value;
    console.log(isAuth);

    if(isAuth == undefined && protectedRoutes.includes(req.nextUrl.pathname)) {
        const absoluteURL = new URL("/auth/login", req.url);
        return NextResponse.redirect(absoluteURL);
    }

    return NextResponse.next();
  }