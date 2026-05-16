"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserRole } from "@/app/generated/prisma/browser";
import { BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  ClipboardList, 
  BarChart3, 
  Receipt, 
  User, 
  AlertCircle,
  Settings
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "clipboard-list": ClipboardList,
  "layout-grid": LayoutGrid,
  "bar-chart-3": BarChart3,
  "receipt": Receipt,
  "user": User,
  "alert-circle": AlertCircle,
  "settings": Settings,
};

interface BottomNavProps {
  role: UserRole;
  currentPath: string;
}

export function BottomNav({ role, currentPath }: BottomNavProps) {
  const items = BOTTOM_NAV_ITEMS[role] || [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
      <div className="grid h-16 grid-cols-[repeat(auto-fit,minmax(60px,1fr))] items-center justify-around px-1">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutGrid;
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
          
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-xs",
                isActive && "text-primary"
              )}
            >
              <Link href={item.href}>
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}