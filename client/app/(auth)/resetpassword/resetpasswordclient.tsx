"use client";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordFormSchema } from "@/schemas/ResetPasswordSchema";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  // Get and decode email from URL params
  const encodedEmail = searchParams.get("email");
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : null;

  const token = searchParams.get("token");
  const router = useRouter();

  // Redirect if email or token is missing
  React.useEffect(() => {
    if (!email || !token) {
      router.push("/sign-in");
    }
  }, [email, token, router]);

  const formSchema = resetPasswordFormSchema()
    .extend({
      confirmPassword: z
        .string()
        .min(1, { message: "Confirm password is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!email || !token) {
      setErrorMessage(
        "Missing email or token. Please request a new password reset."
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("Form Values: ", {
        email: email,
        token: token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });
      const response = await api.post("/Auth/ResetPassword", {
        email: email,
        token: token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });

      router.push("/sign-in");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }

    console.log("Form Values: ", values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">Enter your new password</h1>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormControl>
                    <div className="flex items-center justify-between gap-3">
                      <Lock size={20} className="text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="shad-input"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormControl>
                    <div className="flex items-center justify-between gap-3">
                      <Lock size={20} className="text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        className="shad-input"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <Button
            type="submit"
            className="form-submit-button text-white"
            disabled={isLoading}
          >
            Change Password
            {isLoading && (
              <Image
                src="/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ResetPassword;
