-- AlterTable
ALTER TABLE "test_attempts" ADD COLUMN     "timedOutAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "allowOnlyOneAttempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passingScore" DOUBLE PRECISION,
ADD COLUMN     "testPassword" TEXT;
