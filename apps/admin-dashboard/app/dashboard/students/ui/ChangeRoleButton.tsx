"use client";

import { updateUserRole } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type User = { id: string; email: string | null; role: "ADMIN" | "STUDENT" };

export function ChangeRoleButton({ user }: { user: User }) {
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
    const label = newRole === "ADMIN" ? "Admin" : "O'quvchi";
    if (!confirm(`${user.email ?? ''} rolini ${label} ga o'zgartirasizmi?`)) return;

    setPending(true);
    const result = await updateUserRole(user.id, newRole);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Rol muvaffaqiyatli o'zgartirildi");
    }
    setPending(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={pending}>
      {pending
        ? "..."
        : user.role === "ADMIN"
          ? "O'quvchiga o'tkazish"
          : "Admin qilish"}
    </Button>
  );
}
