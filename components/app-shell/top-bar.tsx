"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCheck } from "lucide-react";
import { getPageTitle } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Notif = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  poId: string | null;
};

export function TopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const loadNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.ok) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, [loadNotifs]);

  // Close drawer on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleReadAll = useCallback(async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }, []);

  const handleReadOne = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <div className="flex items-center gap-2 relative" ref={drawerRef}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifikasi"
            className="relative"
            onClick={handleOpen}
          >
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs pointer-events-none"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <Bell className="h-5 w-5" />
          </Button>

          {/* Notification Drawer */}
          {open && (
            <div className="absolute top-12 right-0 w-80 max-h-[70vh] overflow-y-auto rounded-xl border bg-background shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold">Notifikasi</span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1"
                      onClick={handleReadAll}
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Tandai semua
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada notifikasi
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                        !n.readAt ? "bg-primary/5" : ""
                      }`}
                      onClick={() => !n.readAt && handleReadOne(n.id)}
                    >
                      <div className="flex items-start gap-2">
                        {!n.readAt && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: idLocale })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
