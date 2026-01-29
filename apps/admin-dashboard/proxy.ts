import { NextRequest, NextResponse } from "next/server";
import { ROUTES, UserRole } from "./config/enums";
import { AuthUser } from "@test-system/types";

export function proxy(req: NextRequest) {
    const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.TESTS, ROUTES.STUDENTS]
    const publicRoutes = [ROUTES.ROOT, ROUTES.LOGIN, ROUTES.REGISTER]
    const path = req.nextUrl.pathname

    // if coming path is protected, check if user is authenticated
    if(protectedRoutes.includes(path as ROUTES)) {
        const token = req.cookies.get('token')
        if(!token) {
            return NextResponse.redirect(new URL(ROUTES.LOGIN, req.nextUrl))
        }
    }

    // user role is STUDENT, redirect to student dashboard
    const user = req.cookies.get('user')?.value
    if(user) {
        const userData = JSON.parse(user) as AuthUser
        if(userData.role === UserRole.STUDENT) { // @TODO: this is temp check, we need to directly get role from db
            return NextResponse.redirect(new URL(ROUTES.STUDENT_DASHBOARD, req.nextUrl))
        }
    }

    // if coming path is public and user is authenticated, redirect to dashboard
    if(publicRoutes.includes(path as ROUTES)) {
        const token = req.cookies.get('token')
        if(token) {
            return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.nextUrl))
        }
    }

    return NextResponse.next()
}