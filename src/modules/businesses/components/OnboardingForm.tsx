"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSchema, BusinessInput } from "../validations/onboarding";
import { createBusiness } from "../actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Store, Link as LinkIcon, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessInput>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      name: "",
      slug: "",
      branchName: "Main Branch",
    },
  });

  const onSubmit = (values: BusinessInput) => {
    startTransition(async () => {
      const result = await createBusiness(values, userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Business registered successfully!");
        router.push("/dashboard");
      }
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg p-10 glass rounded-[2rem] shadow-2xl border-white/20"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Register Your Business</h1>
        <p className="text-muted-foreground mt-3 text-lg">Tell us about your restaurant to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold pl-1">Business Name</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...register("name")}
              onChange={handleNameChange}
              placeholder="e.g. Blue Ocean Sushi"
              className="pl-10 h-12 bg-white/50 border-white/40 focus:bg-white rounded-xl transition-all"
              disabled={isPending}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive pl-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold pl-1">Store URL (Slug)</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...register("slug")}
              placeholder="blue-ocean-sushi"
              className="pl-10 h-12 bg-white/50 border-white/40 focus:bg-white rounded-xl transition-all"
              disabled={isPending}
            />
          </div>
          <p className="text-[10px] text-muted-foreground pl-1 uppercase tracking-wider font-bold">This will be your unique identifier</p>
          {errors.slug && <p className="text-xs text-destructive pl-1">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold pl-1">Initial Branch Name</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...register("branchName")}
              placeholder="Main Branch"
              className="pl-10 h-12 bg-white/50 border-white/40 focus:bg-white rounded-xl transition-all"
              disabled={isPending}
            />
          </div>
          {errors.branchName && <p className="text-xs text-destructive pl-1">{errors.branchName.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Complete Registration"}
        </Button>
      </form>
    </motion.div>
  );
}
