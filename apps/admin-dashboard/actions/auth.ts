"use server";

import { flattenError } from "zod";
import { LoginFormSchema, TLoginFormState } from "../definitions/auth";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { mapError } from "@/lib/utils";
import { API_ROUTES, ROUTES } from "@/config/enums";
import { COOKIE_MAX_AGE } from "@/config/constants";

// export const signup = async (data: FormData) => {};

export const login = async (
  state: TLoginFormState,
  data: FormData,
): Promise<TLoginFormState> => {
  let isCookieSet = false;

  try {
    const validatedFields = LoginFormSchema.safeParse({
      email: data.get("email"),
      password: data.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: flattenError(validatedFields.error).fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    // call api to login
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.LOGIN}`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await response.json();
    if (responseData.error) {
      return {
        message: mapError(responseData.error satisfies string),
      };
    }

    const { token, user } = responseData as {
      token: string;
      user: { id: string; email: string; role: string; createdAt: string };
    };

    // set cookies
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
    });
    cookieStore.set(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE,
      },
    );
    isCookieSet = true;
  } catch (error) {
    return {
      errors:
        error instanceof Error
          ? {
              email: [error.message],
              password: [error.message],
            }
          : {
              email: ["Unknown error"],
              password: ["Unknown error"],
            },
    };
  }

  if (isCookieSet) {
    // rewrite to dashboard
    redirect(ROUTES.DASHBOARD, RedirectType.replace);
  }
};

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user");
  redirect(ROUTES.LOGIN);
};
