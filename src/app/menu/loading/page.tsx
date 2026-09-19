"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MenuLoading } from "@/modules/menu/components/MenuLoading";
import { initializeTableSessionAction, createTableSessionAction } from "@/modules/tables/actions/sessionActions";

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

  useEffect(() => {
    async function checkSession() {
      if (!tableId) {
        router.push("/menu");
        return;
      }

      // Check for active session
      let session = await initializeTableSessionAction(tableId);

      if (!session) {
        // No session exists? Create a new one (QR scan starts a session)
        session = await createTableSessionAction(tableId);
      }

      if (session) {
        router.push(`/menu/view?tableId=${tableId}`);
      } else {
        router.push("/menu");
      }
    }

    const timer = setTimeout(() => {
        checkSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, tableId]);

  return <MenuLoading />;
}
