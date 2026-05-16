"use client";

import { Progress } from "@/components/ui/progress";
import { ItemProgress, Department } from "@/app/generated/prisma/browser";

interface ProgressSnapshotProps {
  progress: (ItemProgress & { department: Department })[];
  requiredDepartments: Department[];
}

export function ProgressSnapshot({ progress, requiredDepartments }: ProgressSnapshotProps) {
  const completedCount = progress.filter(p => p.progressValue >= 100).length;
  const totalDepartments = requiredDepartments.length || progress.length;
  const overallProgress = totalDepartments > 0 
    ? Math.round((completedCount / totalDepartments) * 100) 
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Progress: {completedCount}/{totalDepartments} departemen selesai
        </span>
        <span className="font-medium">{overallProgress}%</span>
      </div>
      <Progress value={overallProgress} className="h-2" />
    </div>
  );
}