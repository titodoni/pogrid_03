"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProblemBadgeProps {
  count?: number;
  hasProblem?: boolean;
}

export function ProblemBadge({ count = 0, hasProblem = false }: ProblemBadgeProps) {
  if (!hasProblem && count === 0) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs h-5",
        count > 0 ? "border-orange-500 text-orange-600" : "border-muted"
      )}
    >
      {count > 0 ? `${count} Masalah` : "Masalah"}
    </Badge>
  );
}