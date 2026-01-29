"use client";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export const LoginForm = () => {
  const [state, action, pending] = useActionState(login, undefined);
  console.log("state:", state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Input
          required
          type="email"
          placeholder="Elektron pochta"
          name="email"
          autoFocus
        />
        {state?.errors?.email && (
          <p className="text-red-500 text-sm">
            {state.errors.email.join(", ")}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Input required type="password" placeholder="Parol" name="password" />
        {state?.errors?.password && (
          <p className="text-red-500 text-sm">
            {state.errors.password.join(", ")}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Yuklanmoqda..." : "Kirish"}
      </Button>
      {state?.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
};
