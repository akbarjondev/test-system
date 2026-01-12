import { Test, User } from "@test-system/database/prisma/generated/client";
import {
  TestsRepository,
  UpdateTestData,
} from "src/repositories/tests.repository";
import { UserRole } from "src/types/enums";

export class TestsService {
  static async createTest(test: Omit<Test, "id" | "createdAt">) {
    return await TestsRepository.createTest(test);
  }

  static async getAllTests(
    userId: string,
    userRole: UserRole
  ): Promise<Test[]> {
    if (userRole === UserRole.ADMIN) {
      // Admins see all tests
      return await TestsRepository.getAllTests();
    } else {
      // Students see only tests they have attempted
      return await TestsRepository.getTestsByStudentAttempts(userId);
    }
  }

  static async getTestById(
    id: string,
    includeRelations: boolean = false
  ): Promise<(Test & { createdBy?: Omit<User, "password">; questions?: any[] }) | null> {
    return await TestsRepository.getOneTest(id, includeRelations);
  }

  static async updateTest(
    id: string,
    data: UpdateTestData,
    userId: string,
    userRole: UserRole
  ): Promise<Test> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(id);
    if (!test) {
      throw new Error("Test not found");
    }

    // Validate user owns the test or is admin
    if (test.createdById !== userId && userRole !== UserRole.ADMIN) {
      throw new Error(
        "Unauthorized: You can only update your own tests"
      );
    }

    return await TestsRepository.updateTest(id, data);
  }

  static async deleteTest(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Test> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(id);
    if (!test) {
      throw new Error("Test not found");
    }

    // Validate user owns the test or is admin
    if (test.createdById !== userId && userRole !== UserRole.ADMIN) {
      throw new Error(
        "Unauthorized: You can only delete your own tests"
      );
    }

    return await TestsRepository.deleteTest(id);
  }
}
