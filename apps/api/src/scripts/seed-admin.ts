import dotenv from "dotenv";
dotenv.config();

import { prisma } from "@test-system/database/lib/prisma";
import { hashPassword } from "@test-system/shared/auth";

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: ts-node seed-admin.ts <email> <password>");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists (role: ${existing.role})`);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  const admin = await prisma.user.create({
    data: { email, password: hashed, role: "ADMIN" },
  });

  console.log(`Admin created: ${admin.email} (id: ${admin.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
