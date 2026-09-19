"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, Upload, X, Edit2 } from "lucide-react";
import Image from "next/image";
import { updateSettings } from "../actions/settings";

const SettingsSchema = z.object({
  userName: z.string().min(2),
  email: z.string().email().optional(),
  businessName: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

export function AccountSettingsForm({ user, business, branch }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoBase64, setLogoBase64] = useState(business?.logo || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      userName: user?.name || "",
      email: user?.email || "",
      businessName: business?.name || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      website: business?.website || "",
      logo: business?.logo || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoBase64(base64String);
        form.setValue("logo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: any) => {
    if (!user?.id || !business?.id || !branch?.id) {
      toast.error("User or business context is missing");
      return;
    }
    startTransition(async () => {
      const result = await updateSettings(user.id, business.id, branch.id, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsEditing(false);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {!isEditing && (
        <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
        </div>
      )}

      <div className="p-6 bg-white border rounded-2xl shadow-sm space-y-6">
        <h3 className="font-bold text-lg">Personal Account</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-semibold">Display Name</label>
                {isEditing ? <Input {...form.register("userName")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("userName")}</div>}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                {isEditing ? <Input {...form.register("email")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("email")}</div>}
            </div>
        </div>
      </div>

      <div className="p-6 bg-white border rounded-2xl shadow-sm space-y-6">
        <h3 className="font-bold text-lg">Business Profile</h3>
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold block">Business Logo</label>
            <div 
              className={`relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center ${isEditing ? 'cursor-pointer hover:border-primary' : ''} transition-colors`}
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {logoBase64 ? (
                <>
                  <Image src={logoBase64} alt="Logo" fill className="object-cover rounded-2xl" />
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLogoBase64(""); form.setValue("logo", ""); }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-xs font-medium">{isEditing ? "Click to upload" : "No Logo"}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-sm font-semibold">Business Name</label>
              {isEditing ? <Input {...form.register("businessName")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("businessName")}</div>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Phone Number</label>
              {isEditing ? <Input {...form.register("phone")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("phone")}</div>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Address</label>
              {isEditing ? <Input {...form.register("address")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("address")}</div>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Website</label>
              {isEditing ? <Input {...form.register("website")} className="h-11 rounded-xl" /> : <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{form.getValues("website")}</div>}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="h-11 px-8 rounded-xl font-bold">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="h-11 px-8 rounded-xl font-bold">
                Cancel
            </Button>
        </div>
      )}
    </form>
  );
}
