import * as zod from 'zod'

export const LoginFormSchema = zod.object({
    email: zod.email({error: 'Iltimos to\'g\'ri elektron pochta kiriting'}).trim(),
    password: zod.string().min(4, {error: 'Iltimos parol kamida 4 ta belgidan iborat bo\'lishi kerak'}).trim(),
})

export type TLoginFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined