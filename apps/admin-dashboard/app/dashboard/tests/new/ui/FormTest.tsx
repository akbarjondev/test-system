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
import { useForm } from "react-hook-form";
import { z } from "zod";

const testFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Test nomi 3 ta belgidan kam bo'lmasligi kerak" })
    .max(100, { message: "Test nomi 100 ta belgidan oshmasligi kerak" }),
  description: z.string().optional(),
  pointsPerQuestion: z
    .number()
    .min(1, { message: "Test bali 1 dan kam bo'lmasligi kerak" }),
  timeLimitMinutes: z
    .number()
    .min(1, { message: "Test vaqt limiti 1 daqiqadan kam bo'lmasligi kerak" }),
  isAlwaysAvailable: z.boolean().default(true),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
});

export const FormTest = () => {
  const form = useForm<z.input<typeof testFormSchema>>({
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
    },
  });

  console.log(form.watch());

  const onSubmit = async (data: z.input<typeof testFormSchema>) => {
    // const response = await createTest(data);
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Test nomi</FieldLabel>

            <Input
              {...form.register("title")}
              className={cn(form.formState.errors.title && "border-red-500")}
              autoFocus
              placeholder="Test nomini kiriting"
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>
          <Field>
            <FieldLabel>Test izohi</FieldLabel>
            <Input
              {...form.register("description")}
              className={cn(
                form.formState.errors.description && "border-red-500",
              )}
              placeholder="Test izohini kiriting"
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
          <Field>
            <FieldLabel>Test bali</FieldLabel>
            <FieldDescription>
              Har bir savol uchun hisoblanadigan bal. Masalan: 2.1
            </FieldDescription>
            <Input
              {...form.register("pointsPerQuestion")}
              className={cn(
                form.formState.errors.pointsPerQuestion && "border-red-500",
              )}
              placeholder="Test balini kiriting"
            />
            <FieldError errors={[form.formState.errors.pointsPerQuestion]} />
          </Field>
          <Field>
            <FieldLabel>Test vaqt limiti</FieldLabel>
            <Input
              {...form.register("timeLimitMinutes")}
              className={cn(
                form.formState.errors.timeLimitMinutes && "border-red-500",
              )}
              placeholder="Test vaqt limitini kiriting"
            />
            <FieldError errors={[form.formState.errors.timeLimitMinutes]} />
          </Field>
          <Field>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="isAlwaysAvailable">
                Test har doim mavjud bo'lsinmi?
              </FieldLabel>
              <FieldDescription>
                Ya'ni o'quvchilar testni har doim yecha olishlari mumkinmi? Agar
                ha bo'lsa, test mavjud bo'lishini boshlangan vaqt va tugatilgan
                vaqtni kiritish shart emas.
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

          {!form.getValues("isAlwaysAvailable") && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="availableFrom">
                  Test mavjud bo'lishini boshlangan vaqt
                </FieldLabel>
                <Input
                  {...form.register("availableFrom")}
                  className={cn(
                    form.formState.errors.availableFrom && "border-red-500",
                  )}
                  placeholder="Test mavjud bo'lishini boshlangan vaqtini kiriting"
                />
                <FieldError errors={[form.formState.errors.availableFrom]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="availableUntil">
                  Test mavjud bo'lishini tugatilgan vaqt
                </FieldLabel>
                <Input
                  {...form.register("availableUntil")}
                  className={cn(
                    form.formState.errors.availableUntil && "border-red-500",
                  )}
                  placeholder="Test mavjud bo'lishini tugatilgan vaqtini kiriting"
                />
                <FieldError errors={[form.formState.errors.availableUntil]} />
              </Field>
            </FieldGroup>
          )}
        </FieldSet>
      </FieldGroup>

      <FieldGroup className="flex justify-between gap-2 flex-row mt-10">
        <Button type="submit" className="flex-1">
          {form.formState.isSubmitting
            ? "Test yaratilmoqda..."
            : "Test yaratish"}
          {form.formState.isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
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
