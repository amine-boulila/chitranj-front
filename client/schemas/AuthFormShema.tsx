import { z } from "zod";

type FormType = "sign-in" | "sign-up";

export const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email("Invalid email address"),
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
    fullName:
      formType === "sign-up"
        ? z
            .string()
            .min(2, "Full name must be at least 2 characters")
            .max(50, "Full name cannot exceed 50 characters")
        : z.string().optional(),
  });
};
