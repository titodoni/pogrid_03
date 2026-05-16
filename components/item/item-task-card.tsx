"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Item, ItemProgress, Department, Problem } from "@/app/generated/prisma/browser";
import { UrgencyBorder } from "./urgency-border";
import { ProblemBadge } from "./problem-badge";
import { LineagePill } from "./lineage-pill";
import { getStageLabelFromDeptName, getActiveStage } from "@/lib/po-summary-utils";

type ProgressWithDept = ItemProgress & { department: Department };

interface ItemTaskCardProps {
  item: Item & {
    productionOrder: {
      internalPoNumber: string;
      client: { name: string };
      dueDate?: Date | null;
      manualUrgencyLevel?: string | null;
    };
    progress: ProgressWithDept[];
    problems: Problem[];
    requiredDepartments: Department[];
    parentItem?: { name: string } | null;
  };
  onClick?: () => void;
  /** Jika true, tampilkan detail per tahap (expanded state) */
  expanded?: boolean;
}

export function ItemTaskCard({ item, onClick, expanded = false }: ItemTaskCardProps) {
  const urgencyLevel = getUrgencyLevel(item.productionOrder);
  const now = new Date();
  const overdueDays = item.productionOrder.dueDate
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(item.productionOrder.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const activeProblems = item.problems.filter((p) => !p.isResolved);
  const activeStage = getActiveStage(item.progress);

  // Progress item ini
  const completedDepts = item.progress.filter((p) => p.progressValue >= 100).length;
  const totalDepts = item.requiredDepartments.length || item.progress.length;
  const overallPct = totalDepts > 0 ? Math.round((completedDepts / totalDepts) * 100) : 0;

  return (
    <Card
      className={cn("w-full cursor-pointer transition-shadow hover:shadow-md")}
      onClick={onClick}
    >
      <UrgencyBorder urgencyLevel={urgencyLevel} />
      <CardContent className="pt-4 space-y-3">
        {/* Header: nama item + PO info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground">
              {item.productionOrder.internalPoNumber} &middot;{" "}
              {item.productionOrder.client.name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {item.isRework && item.parentItem && (
              <LineagePill type="REWORK" parentName={item.parentItem.name} />
            )}
            {item.isReturn && item.parentItem && (
              <LineagePill type="RETURN" parentName={item.parentItem.name} />
            )}
            {activeProblems.length > 0 && (
              <ProblemBadge count={activeProblems.length} />
            )}
          </div>
        </div>

        {/* Info qty + keterlambatan */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>{item.quantity} pcs</span>
          </div>
          {overdueDays > 0 ? (
            <span className="text-red-600 font-medium">Terlambat {overdueDays} hari</span>
          ) : null}
        </div>

        {/* Progress bar + label */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Progress:{" "}
              <span className="font-medium text-foreground">
                {completedDepts} dari {totalDepts} tahap selesai
              </span>
            </span>
            <span className="text-xs font-semibold tabular-nums">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-1.5" />
        </div>

        {/* Tahap aktif saat ini */}
        {activeStage && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tahap saat ini</span>
            <span className="text-xs font-medium">
              {getStageLabelFromDeptName(activeStage.department.name)}
            </span>
          </div>
        )}

        {/* EXPANDED: detail per departemen */}
        {expanded && (
          <div className="pt-2 border-t space-y-2">
            {item.progress.map((p) => (
              <ExpandedDeptRow key={p.id} progress={p} />
            ))}
          </div>
        )}

        {/* Masalah aktif */}
        {activeProblems.length > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span className="text-xs text-orange-600 font-medium">
              Masalah: {activeProblems.map((p) => p.description).join("; ")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Row detail per departemen saat card expanded */
function ExpandedDeptRow({ progress }: { progress: ProgressWithDept }) {
  const label = getStageLabelFromDeptName(progress.department.name);
  const isDone = progress.progressValue >= 100;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", isDone && "text-muted-foreground line-through")}>
          {label}
        </span>
        <span className="text-xs tabular-nums">
          {isDone ? "Selesai" : `${progress.progressValue}%`}
        </span>
      </div>
      {!isDone && <Progress value={progress.progressValue} className="h-1" />}
    </div>
  );
}

function getUrgencyLevel(po: {
  dueDate?: Date | null;
  manualUrgencyLevel?: string | null;
}): string {
  const manual = po.manualUrgencyLevel;
  if (
    manual === "RED" ||
    manual === "ORANGE" ||
    manual === "BLOOD_RED" ||
    manual === "NORMAL"
  ) {
    return manual;
  }
  if (!po.dueDate) return "NORMAL";
  const daysUntilDue = Math.floor(
    (new Date(po.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilDue < 0) return "BLOOD_RED";
  if (daysUntilDue <= 3) return "RED";
  if (daysUntilDue <= 7) return "ORANGE";
  return "NORMAL";
}
