import { z } from "zod";

export const questionFormSchema = z.object({
  text: z.string().min(3, { message: "Savol matni bo'sh bo'lmasligi kerak" }),
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, { message: "Javob varianti matni bo'sh bo'lmasligi kerak" }),
        isCorrect: z.boolean(),
        order: z.number(),
        explanation: z.string().optional(),
      }),
    )
    .refine((data) => data.some((option) => option.isCorrect), {
      message: "To'g'ri javob varianti bo'lishi kerak",
      path: ["isCorrect"],
    })
    .refine(
      (data) => data.filter((option) => option.isCorrect === true).length === 1,
      {
        message: "To'g'ri javob varianti faqat bitta bo'lishi kerak",
        path: ["isCorrect"],
      },
    ),
});

export type QuestionFormState = z.infer<typeof questionFormSchema>;
