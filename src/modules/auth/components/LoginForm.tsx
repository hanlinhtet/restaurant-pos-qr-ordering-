"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "../validations/login";
import { login } from "../actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back!");
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to manage your restaurant</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium pl-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="pl-10 h-11 bg-white/50 border-white/40 focus:bg-white rounded-xl transition-all"
              disabled={isPending}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive pl-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between pl-1">
            <label className="text-sm font-medium">Password</label>
            <Link href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="pl-10 h-11 bg-white/50 border-white/40 focus:bg-white rounded-xl transition-all"
              disabled={isPending}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive pl-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2 pl-1">
          <input
            {...register("rememberMe")}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
            disabled={isPending}
          />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
            Remember me on this device
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl text-base font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/register" className="text-primary font-bold hover:underline">Create one</Link>
      </div>
    </motion.div>
  );
}
