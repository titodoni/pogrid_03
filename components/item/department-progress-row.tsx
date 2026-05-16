"use client";

import { CheckCircle, Clock, AlertCircle, PauseCircle } from "lucide-react";
import { ItemProgress, Department } from "@/app/generated/prisma/browser";

interface DepartmentProgressRowProps {
  progress: ItemProgress & { department: Department };
  isActive?: boolean;
  hasProblem?: boolean;
}

export function DepartmentProgressRow({ progress, isActive = false, hasProblem = false }: DepartmentProgressRowProps) {
  const statusIcon = () => {
    if (progress.progressValue >= 100) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (hasProblem) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    if (isActive) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {statusIcon()}
        <span className="text-sm font-medium">{progress.department.name}</span>
      </div>
      <span className="text-sm text-muted-foreground">{progress.progressValue}%</span>
    </div>
  );
}