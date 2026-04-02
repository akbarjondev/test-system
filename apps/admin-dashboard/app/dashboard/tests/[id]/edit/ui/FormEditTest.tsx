"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { updateTest } from "@/actions/tests";
import { toast } from "sonner";
import { Test } from "@test-system/database/prisma/generated/client";

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
  isAlwaysAvailable: z.boolean(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
});

export const FormEditTest = ({ test }: { test: Test }) => {
  const form = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    mode: "onChange",
    defaultValues: {
      title: test.title,
      description: test.description ?? "",
      pointsPerQuestion: test.pointsPerQuestion ?? 1,
      timeLimitMinutes: test.timeLimitMinutes,
      isAlwaysAvailable: test.isAlwaysAvailable,
      availableFrom: test.availableFrom ? new Date(test.availableFrom) : undefined,
      availableUntil: test.availableUntil ? new Date(test.availableUntil) : undefined,
    },
  });

  const isAlwaysAvailable = form.watch("isAlwaysAvailable");

  const onSubmit = async (data: z.infer<typeof testFormSchema>) => {
    const response = await updateTest(test.id, data);
    if (response?.error) {
      toast.error(response.error);
    }
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
              placeholder="Test nomini kiriting"
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>
          <Field>
            <FieldLabel>Test izohi</FieldLabel>
            <Input
              {...form.register("description")}
              placeholder="Test izohini kiriting"
            />
          </Field>
          <Field>
            <FieldLabel>Test bali</FieldLabel>
            <FieldDescription>Har bir savol uchun hisoblanadigan bal.</FieldDescription>
            <Input
              {...form.register("pointsPerQuestion", { valueAsNumber: true })}
              type="number"
              step="0.1"
              className={cn(form.formState.errors.pointsPerQuestion && "border-red-500")}
            />
            <FieldError errors={[form.formState.errors.pointsPerQuestion]} />
          </Field>
          <Field>
            <FieldLabel>Test vaqt limiti (daqiqa)</FieldLabel>
            <Input
              {...form.register("timeLimitMinutes", { valueAsNumber: true })}
              type="number"
              className={cn(form.formState.errors.timeLimitMinutes && "border-red-500")}
            />
            <FieldError errors={[form.formState.errors.timeLimitMinutes]} />
          </Field>
          <Field>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="isAlwaysAvailable">
                Test har doim mavjud bo&apos;lsinmi?
              </FieldLabel>
              <Checkbox
                id="isAlwaysAvailable"
                checked={isAlwaysAvailable}
                onCheckedChange={() =>
                  form.setValue("isAlwaysAvailable", !form.getValues("isAlwaysAvailable"))
                }
              />
            </div>
          </Field>

          {!isAlwaysAvailable && (
            <FieldGroup>
              <Field>
                <FieldLabel>Boshlanish vaqti</FieldLabel>
                <Controller
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <Input
                      type="date"
                      value={field.value ? field.value.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel>Tugash vaqti</FieldLabel>
                <Controller
                  control={form.control}
                  name="availableUntil"
                  render={({ field }) => (
                    <Input
                      type="date"
                      value={field.value ? field.value.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                    />
                  )}
                />
              </Field>
            </FieldGroup>
          )}
        </FieldSet>
      </FieldGroup>

      <FieldGroup className="flex justify-between gap-2 flex-row mt-10">
        <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>Saqlanmoqda... <Loader2 className="size-4 animate-spin ml-1" /></>
          ) : (
            "Saqlash"
          )}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => form.reset()}>
          Bekor qilish
        </Button>
      </FieldGroup>
    </form>
  );
};
