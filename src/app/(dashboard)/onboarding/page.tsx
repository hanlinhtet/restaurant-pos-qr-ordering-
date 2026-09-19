import { auth } from "@/auth";
import { OnboardingForm } from "@/modules/businesses/components/OnboardingForm";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <OnboardingForm userId={session.user.id} />
    </div>
  );
}
