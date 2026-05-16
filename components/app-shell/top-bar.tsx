"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { getPageTitle } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const unreadCount = 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}