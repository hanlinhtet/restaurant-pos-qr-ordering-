import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getFirstAvailableRoute } from "./routes";

export async function protectPage(allowedRoles: UserRole[], isLandingPage = false) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    if (isLandingPage) {
      redirect(getFirstAvailableRoute(session.user.role));
    }
    redirect("/access-denied");
  }

  return session;
}
