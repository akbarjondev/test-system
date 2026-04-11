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
import { createQuestion } from "@/actions/questions";
import { toast } from "sonner";
import { ROUTES } from "@/config/enums";
import { useRouter } from "next/navigation";
import { questionFormSchema } from "@/definitions/questions";

type FormQuestionProps = {
  testId: string;
};

export const FormQuestion = ({ testId }: FormQuestionProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    mode: "onChange",
    defaultValues: {
      text: "",
      options: [
        {
          text: "",
          isCorrect: false,
          order: 1,
          explanation: "",
        },
      ],
    },
  });

  const optionsFields = useFieldArray({
    control: form.control,
    name: "options",
  });

  const onSubmit = async (data: z.infer<typeof questionFormSchema>) => {
    const response = await createQuestion(testId, data);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Savol muvaffaqiyatli qo'shildi");
      form.reset();
      router.push(`${ROUTES.TESTS}/${testId}`);
    }
  };

  const onError = (errors: FieldErrors<z.infer<typeof questionFormSchema>>) => {
    // for isCorrect
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
                className={cn(form.formState.errors.text && "border-destructive")}
                autoFocus
                placeholder="Savol matnini kiriting"
              />
              <FieldError errors={[form.formState.errors.text]} />
            </Field>

            {optionsFields.fields.map((field, index) => (
              <Field key={field.id}>
                <div className="flex justify-between items-center">
                  <FieldLabel>Javob varianti {index + 1}</FieldLabel>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => optionsFields.remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    id={`options.${index}.text`}
                    {...form.register(`options.${index}.text`)}
                    className={cn(
                      form.formState.errors.options?.[index]?.text &&
                        "border-destructive",
                    )}
                  />
                  <FieldError
                    errors={[form.formState.errors.options?.[index]?.text]}
                  />

                  <div className="flex gap-2 justify-between *:w-full">
                    <div>
                      <FieldLabel htmlFor={`options.${index}.isCorrect`}>
                        To'g'ri javobmi?
                      </FieldLabel>
                      <Checkbox
                        id={`options.${index}.isCorrect`}
                        checked={field.isCorrect}
                        onCheckedChange={() =>
                          optionsFields.update(index, {
                            ...form.getValues(`options.${index}`),
                            isCorrect: !form.getValues(`options.${index}`)
                              .isCorrect,
                          })
                        }
                        className={cn(
                          form.formState.errors.options?.[index]?.isCorrect &&
                            "border-destructive",
                        )}
                      />
                      <FieldError
                        errors={[
                          form.formState.errors.options?.[index]?.isCorrect,
                        ]}
                      />
                    </div>
                    {/* TODO: Tartib raqamini qo'shish */}
                    {/* <div>
                      <FieldLabel htmlFor={`options.${index}.order`}>
                        Tartib raqami
                      </FieldLabel>
                      <Input
                        id={`options.${index}.order`}
                        {...form.register(`options.${index}.order`)}
                        type="number"
                        className={cn(
                          form.formState.errors.options?.[index]?.order &&
                            "border-destructive",
                        )}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);

                          optionsFields.update(index, {
                            ...field,
                            order: Number.isNaN(Number(value)) ? 1 : value,
                          });
                        }}
                      />
                    </div> */}
                    <div>
                      <FieldLabel htmlFor={`options.${index}.explanation`}>
                        Izoh
                      </FieldLabel>
                      <Input
                        id={`options.${index}.explanation`}
                        {...form.register(`options.${index}.explanation`)}
                        className={cn(
                          form.formState.errors.options?.[index]?.explanation &&
                            "border-destructive",
                        )}
                      />
                      <FieldError
                        errors={[
                          form.formState.errors.options?.[index]?.explanation,
                        ]}
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
                Javob varianti qo'shish
              </Button>
            )}
          </FieldGroup>
          <div className="flex justify-between gap-2 mt-10">
            <Button type="submit" className="flex-1">
              Saqlash
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => form.reset()}
            >
              Bekor qilish
            </Button>
          </div>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};
