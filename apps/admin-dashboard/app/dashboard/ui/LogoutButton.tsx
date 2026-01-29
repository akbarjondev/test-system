"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import { LogOutIcon } from "lucide-react";

export const LogoutButton = () => {
  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      onClick={() => {
        logout();
      }}
    >
      <LogOutIcon className="size-4" />
      <span className="sr-only">Chiqish</span>
    </Button>
  );
};
