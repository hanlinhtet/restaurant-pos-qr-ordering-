import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StaffActivityWidgetProps {
  staffList: { name: string; role: string; ordersHandled: number }[];
}

export function RecentActivityWidget({ staffList }: StaffActivityWidgetProps) {
  if (!staffList || staffList.length === 0) return null;

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="shrink-0 p-0 mb-4">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Staff Members</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4 p-0">
        {staffList.map((staff, i) => (
          <div key={i} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600">
              <AvatarFallback className="font-bold text-xs">{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate uppercase">{staff.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{staff.role}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
