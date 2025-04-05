"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";
// import Cookies from "js-cookie";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { authFormSchema } from "@/schemas/AuthFormShema";
import GoogleButton from "@/components/GoogleButton";
import FacebookButton from "@/components/FacebookButton";

type FormType = "sign-in" | "sign-up";

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(""); // Clear any previous errors
    console.log(values);
    try {
      if (type === "sign-in") {
        const response = await api.post("/Auth/login", {
          email: values.email,
          password: values.password,
        });
        console.log(response);
        router.push("/");
      } else {
        console.log({
          UserName: values.fullName,
          Email: values.email,
          Password: values.password,
          File: null,
        });
        const formData = new FormData();
        formData.append("UserName", values.fullName || "");
        formData.append("Email", values.email);
        formData.append("Password", values.password);
        const response = await api.post("/Auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(response);
        router.push("/sign-in");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="auth-form space-y-4"
        >
          <h1 className="form-title text-center text-xl font-semibold">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>

          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="relative flex items-center border rounded-lg p-3">
                    <User size={20} className="text-gray-400 mr-3" />
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="w-full focus:ring-0 border-none outline-none"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative flex items-center border rounded-lg p-3">
                  <Mail size={20} className="text-gray-400 mr-3" />
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="w-full focus:ring-0 border-none outline-none"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative flex items-center border rounded-lg p-3">
                  <Lock size={20} className="text-gray-400 mr-3" />
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full focus:ring-0 border-none outline-none"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
                {type == "sign-in" && (
                  <div className="flex justify-end mt-1">
                    <Link
                      href="/forget-password"
                      className="text-brand underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-brand-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span>Loading...</span>
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              </div>
            ) : (
              <span>{type === "sign-in" ? "Sign In" : "Sign Up"}</span>
            )}
          </Button>

          {/* Social Login Buttons */}
          {type === "sign-up" && (
            <div className="flex flex-col space-y-3">
              <GoogleButton text={type} />
              <FacebookButton />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">*{errorMessage}</p>
          )}

          {/* Link to Sign In / Sign Up */}
          <div className="text-center mt-4">
            <p className="text-gray-500">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
              <Link
                href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                className="ml-1 text-brand font-semibold"
              >
                {type === "sign-in" ? "Sign Up" : "Sign In"}
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </>
  );
};

export default AuthForm;
