"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/app/generated/prisma/browser";
import { NAV_CONFIG } from "@/lib/nav-config";
import {
  LayoutGrid,
  ClipboardList,
  BarChart3,
  Receipt,
  User,
  AlertCircle,
  Settings,
  Plus,
  CheckSquare,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "clipboard-list": ClipboardList,
  "layout-grid": LayoutGrid,
  "bar-chart-3": BarChart3,
  "receipt": Receipt,
  "user": User,
  "alert-circle": AlertCircle,
  "settings": Settings,
  "plus": Plus,
  "check-square": CheckSquare,
};

interface BottomNavProps {
  role: UserRole;
  currentPath: string;
}

export function BottomNav({ role, currentPath }: BottomNavProps) {
  const config = NAV_CONFIG[role];
  if (!config) return null;

  const { left, right, fab } = config;
  const allItems = [...left, ...right];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="relative flex h-16 items-center justify-around px-2">
        {/* Left items */}
        <div className="flex flex-1 items-center justify-around">
          {left.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutGrid;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center FAB */}
        {fab && (
          <div className="flex flex-col items-center px-2">
            <Link
              href={fab.href}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-[10px] text-muted-foreground">{fab.label}</span>
            </Link>
          </div>
        )}

        {/* Right items */}
        <div className="flex flex-1 items-center justify-around">
          {right.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutGrid;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
