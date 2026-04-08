import { NextRequest, NextResponse } from "next/server";
import { ROUTES, UserRole } from "./config/enums";
import { AuthUser } from "@test-system/types";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1]!, "base64url").toString("utf8"),
    );
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function clearAuthAndRedirect(req: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL(ROUTES.LOGIN, req.nextUrl));
  res.cookies.delete("token");
  res.cookies.delete("user");
  return res;
}

export function proxy(req: NextRequest) {
  const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.TESTS, ROUTES.STUDENTS];
  const publicRoutes = [ROUTES.ROOT, ROUTES.LOGIN, ROUTES.REGISTER];
  const path = req.nextUrl.pathname;

  // if coming path is protected, check token exists and is not expired
  if (
    protectedRoutes.some(
      (route) => path === route || path.startsWith(route + "/"),
    )
  ) {
    const token = req.cookies.get("token");
    if (!token || isTokenExpired(token.value)) {
      return clearAuthAndRedirect(req);
    }
  }

  // user role is STUDENT, redirect to student dashboard
  const user = req.cookies.get("user")?.value;
  if (user) {
    const userData = JSON.parse(user) as AuthUser;
    if (userData.role === UserRole.STUDENT) {
      // @TODO: this is temp check, we need to directly get role from db
      return NextResponse.redirect(
        new URL(ROUTES.STUDENT_DASHBOARD, req.nextUrl),
      );
    }
  }

  // if coming path is public and user is authenticated, redirect to dashboard
  if (publicRoutes.includes(path as ROUTES)) {
    const token = req.cookies.get("token");
    if (token && !isTokenExpired(token.value)) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.nextUrl));
    }
  }

  return NextResponse.next();
}
