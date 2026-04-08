"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateQuestion } from "@/actions/questions";
import { toast } from "sonner";
import { questionFormSchema } from "@/definitions/questions";
import { Question, Option } from "@test-system/database/prisma/generated/client";

type QuestionWithOptions = Question & { options: Option[] };

export const FormEditQuestion = ({
  question,
  testId,
}: {
  question: QuestionWithOptions;
  testId: string;
}) => {
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    mode: "onChange",
    defaultValues: {
      text: question.text,
      options: question.options
        .sort((a, b) => a.order - b.order)
        .map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          order: o.order,
          explanation: o.explanation ?? "",
        })),
    },
  });

  const optionsFields = useFieldArray({ control: form.control, name: "options" });

  const onSubmit = async (data: z.infer<typeof questionFormSchema>) => {
    const response = await updateQuestion(question.id, testId, data);
    if (response?.error) {
      toast.error(response.error);
    }
  };

  const onError = (errors: FieldErrors<z.infer<typeof questionFormSchema>>) => {
    if (
      errors.options &&
      "isCorrect" in errors.options &&
      errors.options.isCorrect instanceof Object &&
      "message" in errors.options.isCorrect
    ) {
      toast.error(errors.options.isCorrect.message as string);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Savol matni</FieldLabel>
              <Input
                {...form.register("text")}
                className={cn(form.formState.errors.text && "border-red-500")}
              />
              <FieldError errors={[form.formState.errors.text]} />
            </Field>

            {optionsFields.fields.map((field, index) => (
              <Field key={field.id}>
                <div className="flex justify-between items-center">
                  <FieldLabel>Javob varianti {index + 1}</FieldLabel>
                  <Button
                    type="button"
                    className="cursor-pointer hover:bg-red-500"
                    size="icon"
                    onClick={() => optionsFields.remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    {...form.register(`options.${index}.text`)}
                    className={cn(
                      form.formState.errors.options?.[index]?.text && "border-red-500",
                    )}
                  />
                  <FieldError errors={[form.formState.errors.options?.[index]?.text]} />

                  <div className="flex gap-2 justify-between *:w-full">
                    <div>
                      <FieldLabel htmlFor={`options.${index}.isCorrect`}>
                        To&apos;g&apos;ri javobmi?
                      </FieldLabel>
                      <Checkbox
                        id={`options.${index}.isCorrect`}
                        checked={field.isCorrect}
                        onCheckedChange={() =>
                          optionsFields.update(index, {
                            ...form.getValues(`options.${index}`),
                            isCorrect: !form.getValues(`options.${index}`).isCorrect,
                          })
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor={`options.${index}.explanation`}>Izoh</FieldLabel>
                      <Input
                        id={`options.${index}.explanation`}
                        {...form.register(`options.${index}.explanation`)}
                      />
                    </div>
                  </div>
                </div>
              </Field>
            ))}

            {optionsFields.fields.length < 4 && (
              <Button
                type="button"
                onClick={() =>
                  optionsFields.append({
                    text: "",
                    isCorrect: false,
                    order: optionsFields.fields.length + 1,
                    explanation: "",
                  })
                }
              >
                Javob varianti qo&apos;shish
              </Button>
            )}
          </FieldGroup>

          <div className="flex justify-between gap-2 mt-10">
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => form.reset()}>
              Bekor qilish
            </Button>
          </div>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};
