"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveActivityTracker() {
  const router = useRouter();

  useEffect(() => {
    // Poll the server for data revalidation every 15 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
