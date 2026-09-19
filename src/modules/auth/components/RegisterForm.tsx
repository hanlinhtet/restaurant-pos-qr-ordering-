"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterInput } from "../validations/register";
import { registerUser } from "../actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    startTransition(async () => {
      const result = await registerUser(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Account created! Now register your business.");
        router.push("/onboarding");
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted-foreground mt-2">Start your restaurant management journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium pl-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("name")}
              placeholder="John Doe"
              className="pl-10 bg-white/50 rounded-xl h-11"
              disabled={isPending}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive pl-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium pl-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="pl-10 bg-white/50 rounded-xl h-11"
              disabled={isPending}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive pl-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium pl-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-white/50 rounded-xl h-11"
              disabled={isPending}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive pl-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium pl-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-white/50 rounded-xl h-11"
              disabled={isPending}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive pl-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary/20"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
      </div>
    </motion.div>
  );
}
