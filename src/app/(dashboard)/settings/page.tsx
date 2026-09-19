import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/modules/dashboard/components/SettingsTabs";

export default async function SettingsPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });

  console.log("DEBUG SettingsPage session.user.id:", session.user.id);
  console.log("DEBUG SettingsPage businessUser:", businessUser);

  const business = businessUser?.business;
  const branch = business?.branches?.[0];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and branding preferences.</p>
      </div>

      <SettingsTabs 
        user={session.user} 
        business={business}
        branch={branch}
      />
    </div>
  );
}
