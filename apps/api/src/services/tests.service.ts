import { Test } from "@test-system/database/prisma/generated/client";
import { TestsRepository } from "src/repositories/tests.repository";

export class TestsService {
  static async createTest(test: Omit<Test, "id" | "createdAt">) {
    return await TestsRepository.createTest(test);
  }
}
