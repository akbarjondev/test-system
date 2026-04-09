"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { createTest } from "@/actions/tests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const testFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Test nomi 3 ta belgidan kam bo'lmasligi kerak" })
    .max(100, { message: "Test nomi 100 ta belgidan oshmasligi kerak" }),
  description: z.string().optional(),
  pointsPerQuestion: z
    .number()
    .min(1, { message: "Har bir savol uchun ball 1 dan kam bo'lmasligi kerak" }),
  timeLimitMinutes: z
    .number()
    .min(1, { message: "Vaqt chegarasi 1 daqiqadan kam bo'lmasligi kerak" }),
  isAlwaysAvailable: z.boolean(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  testPassword: z
    .string()
    .max(3, { message: "Test kodi 3 ta raqamdan iborat bo'lishi kerak" })
    .regex(/^\d{0,3}$/, { message: "Test kodi 3 ta raqamdan iborat bo'lishi kerak" })
    .optional()
    .or(z.literal("")),
  allowOnlyOneAttempt: z.boolean(),
  passingScore: z
    .number()
    .min(0, { message: "O'tish bali musbat son bo'lishi kerak" })
    .optional()
    .nullable(),
});

export const FormTest = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      pointsPerQuestion: 1,
      timeLimitMinutes: 30,
      isAlwaysAvailable: false,
      availableFrom: undefined,
      availableUntil: undefined,
      testPassword: "",
      allowOnlyOneAttempt: false,
      passingScore: null,
    },
  });

  const isAlwaysAvailable = form.watch("isAlwaysAvailable");

  const onSubmit = async (data: z.infer<typeof testFormSchema>) => {
    const response = await createTest({
      ...data,
      testPassword: data.testPassword || null,
      passingScore: data.passingScore ?? null,
    });
    if (response?.error) {
      toast.error(response.error);
      return;
    }
    if (response?.redirectTo) {
      toast.success("Test muvaffaqiyatli saqlandi");
      router.push(response.redirectTo);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          {/* Nomi */}
          <Field>
            <FieldLabel>Nomi</FieldLabel>
            <Input
              {...form.register("title")}
              className={cn(form.formState.errors.title && "border-red-500")}
              autoFocus
              placeholder="Test nomini kiriting"
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          {/* Tavsif */}
          <Field>
            <FieldLabel>Tavsif</FieldLabel>
            <Input
              {...form.register("description")}
              className={cn(
                form.formState.errors.description && "border-red-500",
              )}
              placeholder="Test tavsifini kiriting (ixtiyoriy)"
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>

          {/* Har bir savol uchun ball */}
          <Field>
            <FieldLabel>Har bir savol uchun ball</FieldLabel>
            <FieldDescription>
              Har bir to'g'ri javob uchun hisoblanadigan ball. Masalan: 2.5
            </FieldDescription>
            <Input
              {...form.register("pointsPerQuestion", { valueAsNumber: true })}
              type="number"
              step="0.1"
              className={cn(
                form.formState.errors.pointsPerQuestion && "border-red-500",
              )}
              placeholder="Masalan: 1"
            />
            <FieldError errors={[form.formState.errors.pointsPerQuestion]} />
          </Field>

          {/* Vaqt chegarasi (daqiqa) */}
          <Field>
            <FieldLabel>Vaqt chegarasi (daqiqa)</FieldLabel>
            <FieldDescription>
              Test uchun ajratilgan vaqt daqiqalarda
            </FieldDescription>
            <Input
              {...form.register("timeLimitMinutes", { valueAsNumber: true })}
              type="number"
              className={cn(
                form.formState.errors.timeLimitMinutes && "border-red-500",
              )}
              placeholder="Masalan: 30"
            />
            <FieldError errors={[form.formState.errors.timeLimitMinutes]} />
          </Field>

          {/* Har doim mavjud */}
          <Field>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="isAlwaysAvailable">
                Har doim mavjud
              </FieldLabel>
              <FieldDescription>
                Agar belgilansa, o'quvchilar testni istalgan vaqtda topshira
                olishadi. Aks holda, boshlanish va tugash vaqtlarini kiriting.
              </FieldDescription>
              <Checkbox
                id="isAlwaysAvailable"
                checked={form.getValues("isAlwaysAvailable")}
                onCheckedChange={() =>
                  form.setValue(
                    "isAlwaysAvailable",
                    !form.getValues("isAlwaysAvailable"),
                  )
                }
                className={cn(
                  "cursor-pointer",
                  form.formState.errors.isAlwaysAvailable && "border-red-500",
                )}
              />
              <FieldError errors={[form.formState.errors.isAlwaysAvailable]} />
            </div>
          </Field>

          {/* Boshlanish / tugash vaqti */}
          {!isAlwaysAvailable && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="availableFrom">
                  Boshlanish vaqti
                </FieldLabel>
                <Controller
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <Input
                      id="availableFrom"
                      type="date"
                      className={cn(
                        form.formState.errors.availableFrom && "border-red-500",
                      )}
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        )
                      }
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.availableFrom]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="availableUntil">
                  Tugash vaqti
                </FieldLabel>
                <Controller
                  control={form.control}
                  name="availableUntil"
                  render={({ field }) => (
                    <Input
                      id="availableUntil"
                      type="date"
                      className={cn(
                        form.formState.errors.availableUntil &&
                          "border-red-500",
                      )}
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        )
                      }
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.availableUntil]} />
              </Field>
            </FieldGroup>
          )}

          {/* Test kodi (3 ta raqam) */}
          <Field>
            <FieldLabel htmlFor="testPassword">
              Test kodi (3 ta raqam)
            </FieldLabel>
            <FieldDescription>
              Talabalar ushbu kod orqali testga kiradi (ixtiyoriy)
            </FieldDescription>
            <Input
              id="testPassword"
              {...form.register("testPassword")}
              type="text"
              maxLength={3}
              className={cn(
                form.formState.errors.testPassword && "border-red-500",
              )}
              placeholder="Masalan: 472"
            />
            <FieldError errors={[form.formState.errors.testPassword]} />
          </Field>

          {/* Faqat bir marta topshirish */}
          <Field>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="allowOnlyOneAttempt"
                  checked={form.watch("allowOnlyOneAttempt")}
                  onCheckedChange={() =>
                    form.setValue(
                      "allowOnlyOneAttempt",
                      !form.getValues("allowOnlyOneAttempt"),
                    )
                  }
                  className="cursor-pointer"
                />
                <FieldLabel htmlFor="allowOnlyOneAttempt" className="mb-0">
                  Faqat bir marta topshirishga ruxsat
                </FieldLabel>
              </div>
              <FieldDescription>
                Agar belgilansa, har bir talaba testni faqat bir marta topshira
                oladi
              </FieldDescription>
              <FieldError
                errors={[form.formState.errors.allowOnlyOneAttempt]}
              />
            </div>
          </Field>

          {/* O'tish bali */}
          <Field>
            <FieldLabel>O&apos;tish bali (ixtiyoriy)</FieldLabel>
            <FieldDescription>
              Agar ko&apos;rsatilsa, talabalar shu baldan yuqori to&apos;plasa,
              &apos;O&apos;tdi&apos; deb belgilanadi
            </FieldDescription>
            <Input
              {...form.register("passingScore", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? null
                    : Number(v),
              })}
              type="number"
              step="0.1"
              min="0"
              className={cn(
                form.formState.errors.passingScore && "border-red-500",
              )}
              placeholder="Masalan: 60"
            />
            <FieldError errors={[form.formState.errors.passingScore]} />
          </Field>
        </FieldSet>
      </FieldGroup>

      <FieldGroup className="flex justify-between gap-2 flex-row mt-10">
        <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              Test yaratilmoqda...
              <Loader2 className="size-4 animate-spin ml-1" />
            </>
          ) : (
            "Test yaratish"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => form.reset()}
        >
          Bekor qilish
        </Button>
      </FieldGroup>
    </form>
  );
};
