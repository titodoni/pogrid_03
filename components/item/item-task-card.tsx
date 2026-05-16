"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Item, ItemProgress, Department, Problem } from "@/app/generated/prisma/browser";
import { UrgencyBorder } from "./urgency-border";
import { ProblemBadge } from "./problem-badge";
import { LineagePill } from "./lineage-pill";
import { ProgressSnapshot } from "./progress-snapshot";

interface ItemTaskCardProps {
  item: Item & {
    productionOrder: {
      internalPoNumber: string;
      client: { name: string };
      dueDate?: Date | null;
      manualUrgencyLevel?: string | null;
    };
    progress: (ItemProgress & { department: Department })[];
    problems: Problem[];
    requiredDepartments: Department[];
    parentItem?: { name: string } | null;
  };
  onClick?: () => void;
}

export function ItemTaskCard({ item, onClick }: ItemTaskCardProps) {
  const urgencyLevel = getUrgencyLevel(item.productionOrder);
  const now = new Date();
  const overdueDays = item.productionOrder.dueDate
    ? Math.max(0, Math.floor((now.getTime() - new Date(item.productionOrder.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Card 
      className={cn("w-full cursor-pointer transition-shadow hover:shadow-md")}
      onClick={onClick}
    >
      <UrgencyBorder urgencyLevel={urgencyLevel} />
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground">
              {item.productionOrder.internalPoNumber} • {item.productionOrder.client.name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {item.isRework && item.parentItem && (
              <LineagePill type="REWORK" parentName={item.parentItem.name} />
            )}
            {item.isReturn && item.parentItem && (
              <LineagePill type="RETURN" parentName={item.parentItem.name} />
            )}
            {item.problems.some(p => !p.isResolved) && (
              <ProblemBadge count={item.problems.filter(p => !p.isResolved).length} />
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <ProgressSnapshot 
            progress={item.progress} 
            requiredDepartments={item.requiredDepartments}
          />
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {overdueDays > 0 ? `${overdueDays} hari terlambat` : "Qty: " + item.quantity}
          </span>
          <StatusBadge status={item.status} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFTING: { label: "Gambar", variant: "secondary" as const },
    PURCHASING: { label: "Purchasing", variant: "secondary" as const },
    PRODUCTION: { label: "Produksi", variant: "default" as const },
    QC: { label: "QC", variant: "outline" as const },
    DELIVERY: { label: "Delivery", variant: "outline" as const },
    DONE: { label: "Selesai", variant: "default" as const },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PRODUCTION;
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

function getUrgencyLevel(item: { dueDate?: Date | null; manualUrgencyLevel?: string | null }): string {
  const manual = item.manualUrgencyLevel;
  if (manual === "RED" || manual === "ORANGE" || manual === "BLOOD_RED" || manual === "NORMAL") {
    return manual;
  }
  
  if (!item.dueDate) return "NORMAL";
  
  const daysUntilDue = Math.floor((new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return "BLOOD_RED";
  if (daysUntilDue <= 3) return "RED";
  if (daysUntilDue <= 7) return "ORANGE";
  return "NORMAL";
}