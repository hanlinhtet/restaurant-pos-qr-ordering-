"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Calendar,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { addStaffAction, removeStaffAction } from "../actions/staff";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StaffMember {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export function StaffList({ staff, businessId }: { staff: StaffMember[], businessId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAddStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;

    if (!name || !email || !password || !role) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await addStaffAction(businessId, { name, email, password, role });
      if (res.success) {
        toast.success(res.success);
        setIsAddOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveStaff(userId: string, name: string | null) {
    if (!confirm(`Are you sure you want to remove ${name || 'this member'}?`)) return;

    try {
      const res = await removeStaffAction(businessId, userId);
      if (res.success) {
        toast.success(res.success);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to remove staff");
    }
  }

  const roleConfig = {
    [UserRole.OWNER]: { color: "bg-rose-500", label: "Owner" },
    [UserRole.MANAGER]: { color: "bg-orange-500", label: "Manager" },
    [UserRole.STAFF]: { color: "bg-blue-500", label: "Cashier" },
    [UserRole.KITCHEN]: { color: "bg-emerald-500", label: "Chef" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Team Management</h2>
            <p className="text-slate-500 text-sm font-medium">Add and manage permissions for your staff.</p>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/10">
              <UserPlus className="h-4 w-4" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <Input name="name" placeholder="e.g. John Doe" className="rounded-xl h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <Input name="email" type="email" placeholder="john@example.com" className="rounded-xl h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Initial Password</label>
                <Input name="password" type="password" placeholder="••••••••" className="rounded-xl h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">System Role</label>
                <Select name="role" defaultValue={UserRole.STAFF}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={UserRole.STAFF}>Cashier (Standard Access)</SelectItem>
                    <SelectItem value={UserRole.KITCHEN}>Chef (Kitchen & Inventory)</SelectItem>
                    <SelectItem value={UserRole.MANAGER}>Manager (All except Staff)</SelectItem>
                    <SelectItem value={UserRole.OWNER}>Owner (Full Control)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 font-bold text-base mt-2">
                {loading ? "Adding..." : "Add to Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-50 border rounded-xl flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                {member.name?.[0] || member.email[0]}
              </div>
              <Badge className={`${roleConfig[member.role].color} text-white border-none font-bold px-3 py-1 rounded-lg`}>
                {roleConfig[member.role].label}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-none">{member.name || 'Unnamed Staff'}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mt-2">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </div>
              </div>

              <hr className="border-slate-50" />

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
                {member.role !== UserRole.OWNER && (
                  <button 
                    onClick={() => handleRemoveStaff(member.id, member.name)}
                    className="text-rose-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                )}
              </div>
            </div>
            
            {member.role === UserRole.OWNER && (
               <div className="absolute top-2 right-2">
                  <Shield className="h-4 w-4 text-slate-200" />
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
