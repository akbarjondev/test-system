"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "./BackButton";

// Show back button only on pages nested deeper than top-level dashboard sections.
// Top-level: /dashboard, /dashboard/tests, /dashboard/students, /dashboard/attempts
// Nested: /dashboard/tests/[id], /dashboard/tests/[id]/edit, etc.
export const ConditionalBackButton = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = "dashboard", segments[1] = section, segments[2]+ = nested
  const isNested = segments.length > 2;

  if (!isNested) return null;

  return (
    <div className="mb-4">
      <BackButton />
    </div>
  );
};
