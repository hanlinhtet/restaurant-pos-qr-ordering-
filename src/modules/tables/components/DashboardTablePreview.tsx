"use client";

import { useEffect, useState } from "react";
import { getTablesByBusinessAction } from "@/modules/tables/actions/tableActions";
import { FloorPlanPreview } from "./FloorPlanPreview";

export function DashboardTablePreview({ businessId }: { businessId: string }) {
    const [tables, setTables] = useState<any[]>([]);

    useEffect(() => {
        async function fetchTables() {
            const data = await getTablesByBusinessAction(businessId);
            setTables(data);
        }
        fetchTables();
        const interval = setInterval(fetchTables, 5000);
        return () => clearInterval(interval);
    }, [businessId]);

    return <FloorPlanPreview tables={tables} />;
}
