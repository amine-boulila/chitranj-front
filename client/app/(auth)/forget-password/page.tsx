"use client";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import api from "@/utils/api";
import { forgetPasswordFormSchema } from "@/schemas/ForgetPasswordSchema";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formSchema = forgetPasswordFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await api.post("/Auth/RequestResetPassword", {
        email: values.email,
      });

      // Show success message once email is sent
      setEmailSent(true);
    } catch (error) {
      console.log(error);
      setErrorMessage("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">Reset Password</h1>

          {emailSent ? (
            <div className="text-center py-4">
              <p className="mb-2">Reset link sent!</p>
              <p className="text-gray-500 text-sm">
                we ve sent a password reset link to your email address. Please
                check your inbox and follow the instructions.
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="text-red-500 text-sm mb-4 text-center">
                  {errorMessage}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="shad-form-item">
                      <FormControl>
                        <div className="flex items-center justify-between gap-3">
                          <Mail size={20} className="text-gray-400" />
                          <Input
                            placeholder="Enter your email"
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

              <Button
                type="submit"
                className="form-submit-button text-white"
                disabled={isLoading}
              >
                Send Reset Link
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
            </>
          )}
        </form>
      </Form>
    </>
  );
};

export default Page;
