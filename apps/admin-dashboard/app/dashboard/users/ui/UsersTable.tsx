"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import type { User } from "../page";

const columns: ColumnDef<User>[] = [
  {
    id: "fullName",
    header: "Ismi",
    accessorFn: (row) => row.fullName ?? row.email ?? "Noma'lum",
    enableSorting: true,
    cell: ({ row }) => {
      return row.original.fullName ?? row.original.email ?? "Noma'lum";
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon raqami",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return role === "ADMIN" ? (
        <Badge className="bg-blue-100 text-blue-800">O&apos;qituvchi</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800">Talaba</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ro'yxatdan o'tgan sana",
    enableSorting: true,
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("DD.MM.YYYY"),
  },
];

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    (u.fullName ?? u.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (users.length === 0) {
    return <p className="text-muted-foreground">Hali foydalanuvchilar yo&apos;q.</p>;
  }

  return (
    <div>
      <Input
        type="text"
        placeholder="Ism bo'yicha qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <DataTable columns={columns} data={filteredUsers} pageSize={10} />
    </div>
  );
}
