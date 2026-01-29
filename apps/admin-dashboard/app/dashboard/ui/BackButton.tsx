"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      onClick={() => router.back()}
    >
      <ArrowLeftIcon className="size-4" />
      <span>Orqaga</span>
    </Button>
  );
};
