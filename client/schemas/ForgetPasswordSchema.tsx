import { z } from "zod";

export const forgetPasswordFormSchema = () => {
  return z.object({
    email: z.string().email("Invalid email address"),
  });
};
