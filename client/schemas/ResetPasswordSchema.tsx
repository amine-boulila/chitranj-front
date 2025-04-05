import { z } from "zod";

export const resetPasswordFormSchema = () => {
  return z.object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(50, "Password cannot exceed 50 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
  });
};
