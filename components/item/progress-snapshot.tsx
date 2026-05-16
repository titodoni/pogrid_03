"use client";

/**
 * ProgressSnapshot — dipakai di card PO (collapsed state).
 *
 * Output contoh:
 *   Progress PO: 1 dari 3 item selesai
 *   [progress bar]
 *   Status item:
 *     Machining: 1 item
 *     Delivery: 1 item
 *   Masalah aktif: 2
 */

import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import type { ItemProgress, Department, Problem } from "@/app/generated/prisma/browser";
import { getStageLabelFromDeptName } from "@/lib/po-summary-utils";

interface ProgressSnapshotProps {
  /** Progress dari satu item (dipakai di ItemTaskCard) */
  progress: (ItemProgress & { department: Department })[];
  requiredDepartments: Department[];
  /** Masalah aktif item ini (opsional) */
  activeProblems?: Problem[];
  /** Jika true, tampilkan grouped stage summary (untuk PO card) */
  showStageSummary?: boolean;
}

export function ProgressSnapshot({
  progress,
  requiredDepartments,
  activeProblems = [],
  showStageSummary = true,
}: ProgressSnapshotProps) {
  const completedCount = progress.filter((p) => p.progressValue >= 100).length;
  const totalCount = requiredDepartments.length || progress.length;
  const overallPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Departemen yang sedang berjalan (belum 100%)
  const activeStages = progress
    .filter((p) => p.progressValue < 100)
    .sort((a, b) => (b.progressValue ?? 0) - (a.progressValue ?? 0));

  // Group per stage label
  const stageCounts: Record<string, number> = {};
  for (const p of activeStages) {
    const label = getStageLabelFromDeptName(p.department.name);
    stageCounts[label] = (stageCounts[label] ?? 0) + 1;
  }
  const stageEntries = Object.entries(stageCounts);

  const problemCount = activeProblems.filter((p) => !p.isResolved).length;

  return (
    <div className="space-y-2">
      {/* Progress PO label */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Progress PO:{" "}
          <span className="font-medium text-foreground">
            {completedCount} dari {totalCount} item selesai
          </span>
        </span>
        <span className="text-xs font-semibold tabular-nums">{overallPct}%</span>
      </div>

      {/* Progress bar */}
      <Progress value={overallPct} className="h-1.5" />

      {/* Status item grouped by stage */}
      {showStageSummary && stageEntries.length > 0 && (
        <div className="pt-1 space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium">Status item:</p>
          {stageEntries.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {count} item
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Masalah aktif */}
      {problemCount > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="text-xs text-orange-600 font-medium">
            Masalah aktif: {problemCount}
          </span>
        </div>
      )}
    </div>
  );
}
