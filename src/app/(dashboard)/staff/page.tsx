import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getBusinessStaff } from "@/modules/staff/actions/staff";
import { StaffList } from "@/modules/staff/components/StaffList";

export default async function StaffPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: true }
  });
  
  if (!businessUser) redirect("/onboarding");

  const staff = await getBusinessStaff(businessUser.businessId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff Management</h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage your team members and their system access levels.
        </p>
      </div>
      
      <StaffList 
        staff={staff} 
        businessId={businessUser.businessId} 
      />
    </div>
  );
}
