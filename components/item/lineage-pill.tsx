"use client";

import { Badge } from "@/components/ui/badge";

interface LineagePillProps {
  type: "REWORK" | "RETURN";
  parentName: string;
}

export function LineagePill({ type, parentName }: LineagePillProps) {
  if (type === "REWORK") {
    return (
      <Badge 
        variant="outline" 
        className="text-xs h-5 border-orange-500 text-orange-600 bg-orange-50"
      >
        ↩ RW dari {parentName}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className="text-xs h-5 border-red-600 text-red-700 bg-red-50"
    >
      ↩ RETURN dari {parentName}
    </Badge>
  );
}