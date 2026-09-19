import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Access Denied</h1>
        <p className="text-slate-500 font-medium max-w-md">
          You don't have the required permissions to view this page. Please contact your manager if you believe this is an error.
        </p>
      </div>
      <Button asChild className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/10">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
