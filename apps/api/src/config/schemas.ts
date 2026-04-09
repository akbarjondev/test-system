import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  pointsPerQuestion: z.number().min(0),
  timeLimitMinutes: z.number().min(1).optional(),
  isAlwaysAvailable: z.boolean().optional(),
  availableFrom: z.string().datetime({ offset: true }).optional().nullable(),
  availableUntil: z.string().datetime({ offset: true }).optional().nullable(),
  testPassword: z.string().length(3).regex(/^\d{3}$/).optional().nullable(),
  allowOnlyOneAttempt: z.boolean().optional(),
  passingScore: z.number().min(0).optional().nullable(),
});

export const updateTestSchema = createTestSchema.partial();

export const createQuestionSchema = z.object({
  text: z.string().min(1),
  explanation: z.string().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number().int().min(0).optional(),
        explanation: z.string().optional(),
      })
    )
    .min(2)
    .max(6),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().optional().nullable(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "STUDENT"]),
});

export const telegramAuthSchema = z.object({
  telegramId: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().min(1),
});

export const testUnlockSchema = z.object({
  testPassword: z.string().length(3).regex(/^\d{3}$/),
});
