"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export default function SessionExpiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-amber-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Completed</h1>
      <p className="text-slate-600 mb-8 max-w-xs">
        Your table session has been closed. If you believe this is an error, please contact our staff.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <Button 
          className="w-full h-12 rounded-xl font-bold"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 w-5 h-5" />
          Back to Home
        </Button>
        
        <p className="text-xs text-slate-400">
          Thank you for dining with us!
        </p>
      </div>
    </div>
  );
}
