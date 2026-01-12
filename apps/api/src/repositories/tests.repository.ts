import { prisma } from "@test-system/database/lib/prisma";
import { Test } from "@test-system/database/prisma/generated/client";

export class TestsRepository {
  static async createTest(test: Omit<Test, "id" | "createdAt">): Promise<Test> {
    return prisma.test.create({
      data: test,
    });
  }

  static async getOneTest(id: string): Promise<Test | null> {
    return prisma.test.findUnique({
      where: {
        id,
      },
    });
  }
}
