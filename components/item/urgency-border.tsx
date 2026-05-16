"use client";

import { cn } from "@/lib/utils";
import { UrgencyLevel } from "@/app/generated/prisma/browser";

interface UrgencyBorderProps {
  urgencyLevel?: UrgencyLevel | string;
}

export function UrgencyBorder({ urgencyLevel }: UrgencyBorderProps) {
  const getColorClass = () => {
    switch (urgencyLevel) {
      case "BLOOD_RED":
        return "border-l-[6px] border-l-[#991B1B]";
      case "RED":
        return "border-l-[6px] border-l-red-500";
      case "ORANGE":
        return "border-l-[6px] border-l-orange-500";
      default:
        return "border-l-[6px] border-l-green-500";
    }
  };

  return (
    <div className={cn("absolute top-0 left-0 w-full h-1", getColorClass())} />
  );
}